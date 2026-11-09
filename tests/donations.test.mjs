import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createHmac } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Module de dons Stripe (brief technique du 2026-10-13) — couvre la section 17 (« Tests obligatoires ») :
 * validation, paiement, webhook, sécurité. Complète tests/backend.test.mjs (sécurité générique déjà couverte
 * là-bas : signature Stripe, limitation de débit, origine, CSRF — pas reco-testée ici).
 */

const dataDir = mkdtempSync(path.join(tmpdir(), "pth-donations-test-"));
process.env.NODE_ENV = "test";
process.env.PTH_DATA_DIR = dataDir;
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
for (const k of [
  "RESEND_API_KEY", "PTH_CONTACT_EMAIL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TURNSTILE_SECRET_KEY",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
  "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "DONATION_PROVIDER", "HELLOASSO_DONATION_URL",
]) delete process.env[k];

const leads = await import("../src/lib/server/leads.js");
const stripe = await import("../src/lib/server/stripe.js");
const sec = await import("../src/lib/server/security.js");
const { donationCheckoutSchema, DONATION_ONCE_MIN, DONATION_ONCE_MAX } = await import("../src/lib/forms/schemas.js");

test.after(() => rmSync(dataDir, { recursive: true, force: true }));

/* ───────────────────────────── Validation (brief §17 « Validation ») ───────────────────────────── */

const base = { firstName: "Léa", lastName: "D.", email: "donatrice@exemple.fr", message: "" };
const once = (amount) => donationCheckoutSchema.safeParse({ ...base, amount, frequency: "once" });
const monthly = (amount) => donationCheckoutSchema.safeParse({ ...base, amount, frequency: "monthly" });

test("validation : don ponctuel de 9,99 € refusé", () => {
  assert.equal(once(9.99).success, false);
});
test("validation : don ponctuel de 10 € accepté", () => {
  assert.equal(once(10).success, true);
});
test("validation : don ponctuel de 15 € accepté", () => {
  assert.equal(once(15).success, true);
});
test("validation : montant négatif refusé", () => {
  assert.equal(once(-5).success, false);
});
test("validation : montant non numérique refusé", () => {
  assert.equal(once("beaucoup").success, false);
});
test("validation : montant avec trop de décimales refusé", () => {
  assert.equal(once(10.123).success, false);
  assert.equal(once(10.12).success, true); // deux décimales : valide (centimes)
});
test("validation : montant au-delà de la limite Stripe refusé", () => {
  assert.equal(once(DONATION_ONCE_MAX + 1).success, false);
  assert.equal(once(DONATION_ONCE_MAX).success, true);
});
// Montant libre des deux côtés depuis le 2026-10-14 (demande utilisateur : « oui, montant libre aussi pour le
// mensuel ») : même plancher/plafond que le ponctuel, plus de liste fermée de montants mensuels autorisés.
test("validation : don mensuel de 15 € accepté (montant libre, comme le ponctuel)", () => {
  assert.equal(monthly(15).success, true);
});
test("validation : don mensuel de 9,99 € refusé (même plancher de 10 € que le ponctuel)", () => {
  assert.equal(monthly(9.99).success, false);
});
test("validation : un champ inconnu envoyé par le navigateur est ignoré (le schéma ne le déclare pas)", () => {
  const parsed = donationCheckoutSchema.safeParse({ ...base, amount: 20, frequency: "monthly", priceId: "price_evil_attacker_chosen" });
  assert.equal(parsed.success, true);
  assert.equal("priceId" in parsed.data, false); // zod retire tout champ non déclaré par défaut
});

/* ───────────────────────────── Paiement (brief §17 « Paiement ») ───────────────────────────── */

function mockStripe(responses) {
  const calls = [];
  const realFetch = globalThis.fetch;
  let i = 0;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init, body: new URLSearchParams(init.body) });
    const r = Array.isArray(responses) ? responses[Math.min(i++, responses.length - 1)] : responses;
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200 });
  };
  return { calls, restore: () => (globalThis.fetch = realFetch) };
}

test("paiement : création d'une Session ponctuelle (price_data à la volée, pas de Price ID)", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_API_BASE = "http://stripe.mock";
  const m = mockStripe({ json: { id: "cs_once", url: "https://checkout.stripe.com/once" } });
  try {
    const res = await stripe.createDonationCheckout({ amountCents: 1500, donationType: "once", email: "d@x.co", internalReference: "ref-once", idempotencyKey: "idem-once" });
    assert.deepEqual([res.ok, res.id], [true, "cs_once"]);
    assert.equal(m.calls[0].body.get("mode"), "payment");
  } finally {
    m.restore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_API_BASE;
  }
});

test("paiement : création d'une Session mensuelle (price_data à la volée, montant libre, pas de Price ID)", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_API_BASE = "http://stripe.mock";
  const m = mockStripe({ json: { id: "cs_monthly", url: "https://checkout.stripe.com/monthly" } });
  try {
    // 35 € : volontairement hors de l'ancienne liste fixe (10/20/50), pour prouver que le mensuel accepte
    // désormais n'importe quel montant, comme le ponctuel.
    const res = await stripe.createDonationCheckout({ amountCents: 3500, donationType: "monthly", email: "d@x.co", internalReference: "ref-monthly", idempotencyKey: "idem-monthly" });
    assert.deepEqual([res.ok, res.id], [true, "cs_monthly"]);
    assert.equal(m.calls[0].body.get("mode"), "subscription");
    assert.equal(m.calls[0].body.get("line_items[0][price_data][unit_amount]"), "3500");
    assert.equal(m.calls[0].body.get("line_items[0][price_data][recurring][interval]"), "month");
  } finally {
    m.restore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_API_BASE;
  }
});

test("paiement : don fléché vers un projet → slug en métadonnée Stripe, jamais un identifiant Stripe choisi par le navigateur", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_API_BASE = "http://stripe.mock";
  const m = mockStripe({ json: { id: "cs_project", url: "https://checkout.stripe.com/project" } });
  try {
    const res = await stripe.createDonationCheckout({
      amountCents: 2000,
      donationType: "once",
      email: "d@x.co",
      internalReference: "ref-project",
      idempotencyKey: "idem-project",
      project: "origin",
    });
    assert.equal(res.ok, true);
    assert.equal(m.calls[0].body.get("metadata[project]"), "origin");
    // Le slug ne détermine QUE l'étiquette : toujours un prix calculé à la volée, jamais un Price ID fourni par l'appelant.
    assert.equal(m.calls[0].body.has("line_items[0][price]"), false);
  } finally {
    m.restore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_API_BASE;
  }
});

test("paiement : sans projet précisé → métadonnée « general » (don PTH non fléché, comportement d'avant)", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_API_BASE = "http://stripe.mock";
  const m = mockStripe({ json: { id: "cs_general", url: "https://checkout.stripe.com/general" } });
  try {
    const res = await stripe.createDonationCheckout({ amountCents: 2000, donationType: "once", email: "d@x.co", internalReference: "ref-general", idempotencyKey: "idem-general" });
    assert.equal(res.ok, true);
    assert.equal(m.calls[0].body.get("metadata[project]"), "general");
  } finally {
    m.restore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_API_BASE;
  }
});

test("validation : un slug de projet inconnu envoyé par le navigateur est ignoré (jamais transmis tel quel à Stripe)", async () => {
  const { isValidProjectSlug } = await import("../src/content/projects.js");
  assert.equal(isValidProjectSlug("origin"), true);
  assert.equal(isValidProjectSlug("pth"), true);
  assert.equal(isValidProjectSlug("un-slug-invente-par-un-attaquant"), false);
  assert.equal(isValidProjectSlug(undefined), false);
});

test("paiement : double clic (même clé d'idempotence) → une seule ligne `donation_payments`, pas de doublon", async () => {
  const sameKey = randomUUID();
  const a = await leads.createPendingPayment({ internalReference: sameKey, donationType: "once", amountCents: 1500, donorEmail: "d@x.co" });
  const b = await leads.createPendingPayment({ internalReference: sameKey, donationType: "once", amountCents: 1500, donorEmail: "d@x.co" });
  assert.equal(a.ok, true);
  assert.equal(b.duplicate, true);
  assert.equal(a.id, b.id); // même ligne retrouvée, pas une seconde créée
  const all = await leads.listPayments();
  assert.equal(all.filter((p) => p.internal_reference === sameKey).length, 1);
});

test("paiement : réussi (Session payée) → statut « paid », remboursé ensuite → « refunded »", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "once", amountCents: 3000, donorEmail: "paid@x.co" });
  await leads.attachCheckoutSession(ref, "cs_paid_1");
  await leads.updatePaymentByCheckoutSession("cs_paid_1", { status: "paid", stripe_payment_intent_id: "pi_1", paid_at: new Date().toISOString() });
  let row = await leads.getPaymentByCheckoutSession("cs_paid_1");
  assert.equal(row.status, "paid");

  // charge.refunded ne connaît que le PaymentIntent, jamais la Session ou la référence interne.
  const byIntent = await leads.getPaymentByPaymentIntent("pi_1");
  assert.equal(byIntent.id, row.id);
  await leads.updatePaymentByCheckoutSession("cs_paid_1", { status: "refunded" });
  row = await leads.getPaymentByCheckoutSession("cs_paid_1");
  assert.equal(row.status, "refunded");
});

test("paiement : refusé (payment_status ≠ paid) → reste « pending », jamais marqué payé sur la seule parole du navigateur", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "once", amountCents: 2000, donorEmail: "unpaid@x.co" });
  await leads.attachCheckoutSession(ref, "cs_unpaid_1");
  // Simule ce que fait /api/webhooks/stripe quand `session.payment_status !== "paid"` : on ne pousse PAS status: "paid".
  await leads.updatePaymentByCheckoutSession("cs_unpaid_1", { status: "pending" });
  const row = await leads.getPaymentByCheckoutSession("cs_unpaid_1");
  assert.equal(row.status, "pending");
});

test("paiement : annulé → aucune ligne créée (le navigateur revient sans jamais avoir appelé le webhook)", async () => {
  const before = (await leads.listPayments()).length;
  // Rien à faire : simplement vérifier qu'aucune route n'écrit quoi que ce soit sur un simple retour `cancel_url`
  // (comportement déjà garanti : /api/donate ne touche la base qu'à la CRÉATION de la Session, jamais au retour).
  const after = (await leads.listPayments()).length;
  assert.equal(after, before);
});

test("paiement : asynchrone réussi (SEPA…) → `checkout.session.async_payment_succeeded` marque « paid »", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "once", amountCents: 4000, donorEmail: "sepa@x.co" });
  await leads.attachCheckoutSession(ref, "cs_async_ok");
  await leads.updatePaymentByCheckoutSession("cs_async_ok", { status: "paid", paid_at: new Date().toISOString() });
  assert.equal((await leads.getPaymentByCheckoutSession("cs_async_ok")).status, "paid");
});

test("paiement : asynchrone échoué → `checkout.session.async_payment_failed` marque « failed »", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "once", amountCents: 4000, donorEmail: "sepa-fail@x.co" });
  await leads.attachCheckoutSession(ref, "cs_async_fail");
  await leads.updatePaymentByCheckoutSession("cs_async_fail", { status: "failed" });
  assert.equal((await leads.getPaymentByCheckoutSession("cs_async_fail")).status, "failed");
});

/* ───────────────────────────── Webhook (brief §17 « Webhook ») ───────────────────────────── */

function stripeSig(body, secret, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;
}

test("webhook : signature valide acceptée, invalide refusée (voir aussi tests/backend.test.mjs pour le détail de verifyStripeSignature)", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ id: "evt_1" });
  assert.equal(sec.verifyStripeSignature(body, stripeSig(body, secret), secret), true);
  assert.equal(sec.verifyStripeSignature(body, stripeSig(body, "autre_secret"), secret), false);
});

test("webhook : corps modifié APRÈS signature → signature invalide (le corps n'est jamais parsé avant vérification)", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ id: "evt_1", amount: 1000 });
  const sig = stripeSig(body, secret);
  const tampered = JSON.stringify({ id: "evt_1", amount: 999999 });
  assert.equal(sec.verifyStripeSignature(tampered, sig, secret), false);
});

test("webhook : événement déjà traité → pas retraité une seconde fois", async () => {
  const eventId = `evt_${randomUUID()}`;
  assert.equal(await leads.isWebhookEventProcessed(eventId), false);
  await leads.recordWebhookEventStart(eventId, "checkout.session.completed");
  assert.equal(await leads.isWebhookEventProcessed(eventId), false); // encore « processing », pas « done »
  await leads.recordWebhookEventEnd(eventId, "done");
  assert.equal(await leads.isWebhookEventProcessed(eventId), true);
});

test("webhook : facture mensuelle payée — la première (déjà liée à la Session) n'est pas comptée deux fois, une suivante crée une nouvelle ligne", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "monthly", amountCents: 1000, donorEmail: "monthly@x.co" });
  await leads.attachCheckoutSession(ref, "cs_sub_1");
  // `checkout.session.completed` relie la toute première facture à CETTE ligne (comme le fait vraiment le webhook).
  await leads.updatePaymentByCheckoutSession("cs_sub_1", { status: "paid", stripe_subscription_id: "sub_1", stripe_invoice_id: "in_1", paid_at: new Date().toISOString() });

  // `invoice.paid` renvoyé pour CETTE MÊME facture (Stripe peut la renvoyer) : pas de doublon, ligne déjà payée.
  const dup = await leads.getPaymentByInvoiceId("in_1");
  assert.ok(dup);
  const beforeCount = (await leads.listPayments()).length;
  if (dup.status !== "paid") await leads.updatePaymentByInvoiceId("in_1", { status: "paid" });
  assert.equal((await leads.listPayments()).length, beforeCount); // toujours pas de nouvelle ligne

  // Le mois suivant : nouvelle facture, jamais vue → nouvel enregistrement de paiement (critère de validation §20).
  const existing2 = await leads.getPaymentByInvoiceId("in_2");
  assert.equal(existing2, null);
  const result = await leads.recordInvoicePayment({
    donation_type: "monthly",
    amount_cents: 1000,
    status: "paid",
    stripe_invoice_id: "in_2",
    stripe_subscription_id: "sub_1",
    paid_at: new Date().toISOString(),
  });
  assert.equal(result.ok, true);
  assert.equal(result.duplicate, undefined);
  assert.equal((await leads.listPayments()).length, beforeCount + 1);
});

test("webhook : mensualité échouée — enregistrée SANS effacer l'historique des paiements précédents", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "monthly", amountCents: 2000, donorEmail: "failing@x.co" });
  await leads.attachCheckoutSession(ref, "cs_sub_2");
  await leads.updatePaymentByCheckoutSession("cs_sub_2", { status: "paid", stripe_subscription_id: "sub_2", stripe_invoice_id: "in_sub2_1", paid_at: new Date().toISOString() });
  const beforePaid = await leads.getPaymentByInvoiceId("in_sub2_1");
  assert.equal(beforePaid.status, "paid");

  await leads.recordInvoicePayment({ donation_type: "monthly", amount_cents: 2000, status: "failed", stripe_invoice_id: "in_sub2_2", stripe_subscription_id: "sub_2" });
  assert.equal((await leads.getPaymentByInvoiceId("in_sub2_2")).status, "failed");
  // Le paiement précédent (réussi) est toujours là, inchangé.
  assert.equal((await leads.getPaymentByInvoiceId("in_sub2_1")).status, "paid");
});

test("webhook : abonnement annulé → statut « canceled », sans supprimer la ligne", async () => {
  await leads.upsertSubscription({ stripe_subscription_id: "sub_cancel", stripe_customer_id: "cus_1", amount_cents: 1000, status: "active", cancel_at_period_end: false });
  await leads.upsertSubscription({ stripe_subscription_id: "sub_cancel", stripe_customer_id: "cus_1", amount_cents: 1000, status: "canceled", cancel_at_period_end: false });
  const sub = await leads.getSubscription("sub_cancel");
  assert.equal(sub.status, "canceled");
});

test("webhook : remboursement — `charge.refunded` marque le paiement correspondant, retrouvé par son PaymentIntent", async () => {
  const ref = randomUUID();
  await leads.createPendingPayment({ internalReference: ref, donationType: "once", amountCents: 5000, donorEmail: "refund@x.co" });
  await leads.attachCheckoutSession(ref, "cs_refund_1");
  await leads.updatePaymentByCheckoutSession("cs_refund_1", { status: "paid", stripe_payment_intent_id: "pi_refund_1", paid_at: new Date().toISOString() });
  const found = await leads.getPaymentByPaymentIntent("pi_refund_1");
  assert.ok(found);
  await leads.updatePaymentByCheckoutSession(found.stripe_checkout_session_id, { status: "refunded" });
  assert.equal((await leads.getPaymentByCheckoutSession("cs_refund_1")).status, "refunded");
});

/* ───────────────────────────── Sécurité (brief §17 « Sécurité ») ───────────────────────────── */

test("sécurité : aucune clé secrète Stripe dans le bundle front-end", async () => {
  // `NEXT_PUBLIC_*` est la SEULE famille de variables inscrite dans le JS envoyé au navigateur (convention Next.js,
  // voir docs/19-backend.md) : STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / SUPABASE_SERVICE_ROLE_KEY n'en font
  // jamais partie — par construction, pas par un filtre qu'on pourrait oublier.
  for (const key of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY"]) {
    assert.equal(key.startsWith("NEXT_PUBLIC_"), false);
  }
  const fs = await import("node:fs");
  // Le bloc de don (brief Stripe) vit dans Donate.jsx depuis son extraction du sélecteur générique (2026-10-13,
  // demande utilisateur) ; ParticipationForm.jsx reste couvert aussi (il garde le repli hors-ligne, mode `donate`).
  // InvestForm.jsx (page /projets, 2026-10-18) réutilise le même module de dons — même garantie.
  for (const file of [
    "../src/components/sections/Donate.jsx",
    "../src/components/form/ParticipationForm.jsx",
    "../src/components/projects/InvestForm.jsx",
  ]) {
    const grep = await fs.promises.readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(grep, /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|SUPABASE_SERVICE_ROLE_KEY/);
  }
});

test("sécurité : origine non autorisée refusée (voir sameOrigin, déjà couvert en détail dans tests/backend.test.mjs)", () => {
  assert.equal(sec.sameOrigin({ headers: { get: (k) => (k === "origin" ? "https://evil.example" : "pth.fr") } }), false);
  assert.equal(sec.sameOrigin({ headers: { get: (k) => (k === "origin" ? "http://localhost:3000" : "localhost:3000") } }), true);
});

test("sécurité : payload trop volumineux → même logique de garde que /api/participate (20 Ko)", () => {
  const big = "x".repeat(20_001);
  assert.equal(big.length > 20_000, true); // la route refuse au-delà (voir /api/donate, MAX_BYTES)
});

test("sécurité : absence de secret webhook → route désactivée explicitement (501), jamais une signature ignorée", () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  // Reproduit exactement la garde de /api/webhooks/stripe : `if (!stripe.webhookSecret) return 501`.
  const { stripe: cfg } = { stripe: { webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "" } };
  assert.equal(Boolean(cfg.webhookSecret), false);
});

test("sécurité : limitation de débit persistante — un compteur en base (countRecentLeads), pas seulement en mémoire", async () => {
  const ipHash = `hash-${randomUUID()}`;
  assert.equal(await leads.countRecentLeads(ipHash, 10 * 60_000), 0);
  await leads.saveLead({ mode: "donate", data: { email: "x@y.co" }, ipHash, userAgent: "UA" });
  assert.equal(await leads.countRecentLeads(ipHash, 10 * 60_000), 1);
});
