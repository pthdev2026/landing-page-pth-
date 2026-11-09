import { NextResponse } from "next/server";
import { settings } from "../../../../lib/server/config.js";
import { verifyStripeSignature } from "../../../../lib/server/security.js";
import {
  attachCheckoutSession,
  getPaymentByCheckoutSession,
  getPaymentByPaymentIntent,
  updatePaymentByCheckoutSession,
  updatePaymentByInvoiceId,
  recordInvoicePayment,
  getPaymentByInvoiceId,
  upsertSubscription,
  getSubscription,
  isWebhookEventProcessed,
  recordWebhookEventStart,
  recordWebhookEventEnd,
} from "../../../../lib/server/leads.js";
import { thankDonor } from "../../../../lib/server/emails.js";

/**
 * POST /api/webhooks/stripe — Stripe nous prévient qu'un paiement/abonnement a changé d'état.
 * Seul endroit qui marque un don « payé » : la signature de l'événement est vérifiée AVANT tout (sinon 400),
 * le corps n'est JAMAIS lu/modifié avant cette vérification.
 * Déduplication : chaque `event.id` est enregistré dans `stripe_webhook_events` ; un événement déjà traité
 * (« done ») est acquitté (200) sans être retraité — Stripe peut renvoyer le même événement plusieurs fois.
 * À déclarer chez Stripe : https://<domaine>/api/webhooks/stripe, événements :
 *   checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
 *   invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded.
 */

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",
]);

export async function POST(request) {
  const { stripe } = settings();
  if (!stripe.webhookSecret) return NextResponse.json({ ok: false, error: "Webhook non configuré." }, { status: 501 });

  const raw = await request.text(); // corps BRUT : la signature porte sur les octets exacts, jamais parsé avant vérification
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"), stripe.webhookSecret)) {
    return NextResponse.json({ ok: false, error: "Signature invalide." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Corps invalide." }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) return NextResponse.json({ ok: true, ignored: true });
  if (await isWebhookEventProcessed(event.id)) return NextResponse.json({ ok: true, duplicate: true });

  await recordWebhookEventStart(event.id, event.type);
  try {
    await handleEvent(event);
    await recordWebhookEventEnd(event.id, "done");
  } catch (error) {
    // On journalise l'erreur SANS la renvoyer au navigateur (ni à Stripe au-delà d'un 200 : des ré-essais ne
    // corrigeraient pas un bug de notre côté, et renvoyer un code d'erreur à Stripe déclenche des tentatives
    // répétées inutiles). Le statut « error » reste visible dans `stripe_webhook_events` pour investigation.
    console.error(`[stripe-webhook] ${event.type} (${event.id}) :`, error.message);
    await recordWebhookEventEnd(event.id, "error", error.message);
  }
  return NextResponse.json({ ok: true });
}

async function handleEvent(event) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return onCheckoutSession(obj, event.type);
    case "checkout.session.async_payment_failed":
      return onCheckoutSession(obj, event.type);
    case "invoice.paid":
      return onInvoicePaid(obj);
    case "invoice.payment_failed":
      return onInvoiceFailed(obj);
    case "customer.subscription.updated":
      return onSubscriptionUpdated(obj);
    case "customer.subscription.deleted":
      return onSubscriptionDeleted(obj);
    case "charge.refunded":
      return onChargeRefunded(obj);
  }
}

/** `checkout.session.completed` / `.async_payment_succeeded` / `.async_payment_failed` — la Session devient le premier paiement. */
async function onCheckoutSession(session, eventType) {
  const internalReference = session.metadata?.internal_reference || "";
  // La ligne « en attente » a été créée par /api/donate AVANT l'appel à Stripe ; on la retrouve par la Session
  // (déjà associée) ou, à défaut (ligne jamais créée — panne passée), par la référence interne en métadonnée.
  let payment = await getPaymentByCheckoutSession(session.id);
  if (!payment && internalReference) {
    await attachCheckoutSession(internalReference, session.id);
    payment = await getPaymentByCheckoutSession(session.id);
  }

  const failed = eventType === "checkout.session.async_payment_failed";
  // Pour un paiement ponctuel, ne marquer « paid » QUE si Stripe confirme vraiment le paiement (pas seulement
  // que la Session s'est terminée — un virement SEPA différé peut rester « unpaid » un moment).
  const paid = !failed && session.payment_status === "paid";
  const patch = {
    status: failed ? "failed" : paid ? "paid" : "pending",
    stripe_payment_intent_id: session.payment_intent || null,
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    stripe_invoice_id: session.invoice || null, // relie la toute première facture d'un abonnement : évite de la recompter via `invoice.paid`
    donor_email: session.customer_details?.email || session.customer_email || payment?.donor_email || null,
    paid_at: paid ? new Date().toISOString() : null,
  };
  await updatePaymentByCheckoutSession(session.id, patch);

  if (paid && payment?.status !== "paid") {
    const email = patch.donor_email;
    if (email) {
      await thankDonor({
        email,
        name: payment?.donor_name,
        amountCents: payment?.amount_cents ?? Number(session.metadata?.amount_cents || 0),
        currency: session.currency || "eur",
        frequency: session.mode === "subscription" ? "monthly" : "once",
      });
    }
  }

  // Abonnement démarré : une première trace dans `donation_subscriptions`, affinée par `customer.subscription.updated`
  // (qui suit toujours la création chez Stripe) — amount_cents déjà connu par nos métadonnées, pas besoin d'un appel Stripe de plus.
  if (session.mode === "subscription" && session.subscription && session.customer) {
    await upsertSubscription({
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      donor_email: patch.donor_email,
      amount_cents: payment?.amount_cents ?? Number(session.metadata?.amount_cents || 0),
      currency: session.currency || "eur",
      status: failed ? "incomplete" : "active",
      cancel_at_period_end: false,
    });
  }
}

/** `invoice.paid` — une mensualité réellement payée (la première, déjà comptée via la Session, OU une suivante : nouvelle ligne). */
async function onInvoicePaid(invoice) {
  const existing = await getPaymentByInvoiceId(invoice.id);
  if (existing) {
    // Déjà créée par `checkout.session.completed` (toute première facture d'un abonnement) : on met à jour, pas de doublon
    // (unicité de `stripe_invoice_id` en base de toute façon).
    if (existing.status !== "paid") await updatePaymentByInvoiceId(invoice.id, { status: "paid", paid_at: new Date().toISOString() });
    return;
  }
  const result = await recordInvoicePayment({
    donation_type: "monthly",
    amount_cents: invoice.amount_paid,
    currency: invoice.currency || "eur",
    status: "paid",
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription || null,
    stripe_customer_id: invoice.customer || null,
    donor_email: invoice.customer_email || null,
    paid_at: new Date().toISOString(),
  });
  if (result.ok && !result.duplicate && invoice.customer_email) {
    await thankDonor({ email: invoice.customer_email, amountCents: invoice.amount_paid, currency: invoice.currency || "eur", frequency: "monthly" });
  }
}

/** `invoice.payment_failed` — une mensualité a échoué. On garde tout l'historique précédent, on ajoute juste cette ligne. */
async function onInvoiceFailed(invoice) {
  const existing = await getPaymentByInvoiceId(invoice.id);
  if (existing) {
    if (existing.status !== "failed") await updatePaymentByInvoiceId(invoice.id, { status: "failed" });
  } else {
    await recordInvoicePayment({
      donation_type: "monthly",
      amount_cents: invoice.amount_due,
      currency: invoice.currency || "eur",
      status: "failed",
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: invoice.subscription || null,
      stripe_customer_id: invoice.customer || null,
      donor_email: invoice.customer_email || null,
    });
  }
  if (invoice.subscription) {
    const sub = await getSubscription(invoice.subscription);
    if (sub) await upsertSubscription({ ...sub, status: "past_due" });
  }
}

/** `customer.subscription.updated` — synchronise statut, montant, échéance, résiliation programmée. */
async function onSubscriptionUpdated(subscription) {
  const item = subscription.items?.data?.[0];
  await upsertSubscription({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    amount_cents: item?.price?.unit_amount ?? 0,
    currency: item?.price?.currency || "eur",
    status: subscription.status,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
  });
}

/** `customer.subscription.deleted` — la résiliation prend effet (fin de période déjà payée, configuré côté Stripe Customer Portal). */
async function onSubscriptionDeleted(subscription) {
  await upsertSubscription({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    amount_cents: subscription.items?.data?.[0]?.price?.unit_amount ?? 0,
    currency: subscription.items?.data?.[0]?.price?.currency || "eur",
    status: "canceled",
    cancel_at_period_end: false,
  });
}

/** `charge.refunded` — marque le paiement concerné comme remboursé (recherché par son PaymentIntent). */
async function onChargeRefunded(charge) {
  if (!charge.payment_intent) return;
  const payment = await getPaymentByPaymentIntent(charge.payment_intent);
  if (payment?.stripe_checkout_session_id) {
    await updatePaymentByCheckoutSession(payment.stripe_checkout_session_id, { status: "refunded" });
  } else if (payment?.stripe_invoice_id) {
    await updatePaymentByInvoiceId(payment.stripe_invoice_id, { status: "refunded" });
  }
}
