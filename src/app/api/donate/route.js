import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { donationCheckoutSchema, DONATION_ONCE_MIN } from "../../../lib/forms/schemas.js";
import { isValidProjectSlug } from "../../../content/projects.js";
import { donationPaymentLink, donationProvider, settings } from "../../../lib/server/config.js";
import { clientIp, hashIp, sameOrigin, rateLimit } from "../../../lib/server/security.js";
import { verifyTurnstile } from "../../../lib/server/turnstile.js";
import { saveLead, leadName, createPendingPayment, attachCheckoutSession, countRecentLeads } from "../../../lib/server/leads.js";
import { notifyTeam } from "../../../lib/server/emails.js";
import { createDonationCheckout } from "../../../lib/server/stripe.js";

/**
 * POST /api/donate — démarre un don en ligne (brief technique Stripe du 2026-10-13).
 *   stripe    : crée une ligne `donation_payments` « en attente », une session Stripe Checkout, renvoie son URL.
 *   helloasso : renvoie le lien du formulaire de don HelloAsso (déjà configuré chez eux, reçus fiscaux inclus).
 *   none      : 501 (le formulaire retombe sur l'envoi classique « laissez vos coordonnées »).
 * Le don n'est compté « payé » QUE par le webhook Stripe (/api/webhooks/stripe), jamais sur la parole du navigateur
 * — cette route ne fait que démarrer le paiement, jamais le confirmer.
 *
 * Chaîne : taille → origine → champ piège → validation (zod, montant compris) → Turnstile → limitation de débit
 *          (mémoire + base, comme /api/participate) → ligne « en attente » → Checkout Session (avec clé
 *          d'idempotence) → email à l'équipe (information, non bloquant pour le paiement).
 */

const fail = (error, status, code) => NextResponse.json({ ok: false, error, code }, { status });

export async function POST(request) {
  const provider = donationProvider();
  if (provider === "none") return fail("Le paiement en ligne n'est pas activé.", 501, "PROVIDER_DISABLED");
  if (!sameOrigin(request)) return fail("Origine refusée.", 403, "FORBIDDEN_ORIGIN");

  const raw = await request.text();
  if (raw.length > 20_000) return fail("Requête trop volumineuse.", 413, "PAYLOAD_TOO_LARGE");
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail("Requête invalide.", 400, "INVALID_JSON");
  }
  // Champ piège rempli = robot : faux succès, rien n'est créé ni appelé côté Stripe. Testé AVANT la validation
  // (une erreur apprendrait au robot qu'il a été repéré).
  if (typeof payload?.website === "string" && payload.website.trim() !== "") return NextResponse.json({ ok: true, url: "/merci?don=1" });

  const parsed = donationCheckoutSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code = issue?.path?.[0] === "amount" ? "INVALID_AMOUNT" : "INVALID_DATA";
    return fail(issue?.message || "Données invalides.", 422, code);
  }

  const ip = clientIp(request);
  const ipHash = hashIp(ip);
  const human = await verifyTurnstile(payload.turnstileToken, ip);
  if (!human.ok) return fail("Vérification anti-robot échouée.", human.error === "unavailable" ? 503 : 400, "BOT_CHECK_FAILED");
  // Persistant (base) + mémoire : la mémoire seule ne survit pas à un redémarrage d'instance (serverless).
  if (rateLimit(`donate:${ipHash}`, { windowMs: 10 * 60_000, max: 8 }) || (await countRecentLeads(ipHash, 10 * 60_000)) >= 8) {
    return fail("Trop de tentatives. Réessayez dans quelques minutes.", 429, "RATE_LIMITED");
  }

  const { website: _honeypot, idempotencyKey: clientKey, ...data } = parsed.data;
  // Double verrou monétaire : la route revalide ce que le schéma a déjà vérifié (jamais confiance au seul
  // front-end). Montant libre des deux côtés depuis le 2026-10-14 (demande utilisateur) : même plancher pour le
  // ponctuel et le mensuel, Stripe crée le prix à la volée dans les deux cas (voir `stripe.js`).
  const amountCents = Math.round(data.amount * 100);
  if (!Number.isInteger(amountCents) || amountCents <= 0) return fail("Montant invalide.", 422, "INVALID_AMOUNT");
  if (amountCents < DONATION_ONCE_MIN * 100) {
    return fail(`Le montant minimum est de ${DONATION_ONCE_MIN} €.`, 422, "INVALID_AMOUNT");
  }

  // UUID v4 d'idempotence : celui du navigateur (une tentative relancée réutilise la même clé) sinon on en génère un
  // — jamais de création de session sans clé, pour ne jamais dépendre d'un navigateur mal formé.
  const idempotencyKey = clientKey || randomUUID();
  const name = leadName(data);
  // Don fléché vers un projet (page /projets, 2026-10-18) : le navigateur n'envoie qu'un slug — jamais un
  // identifiant Stripe — et ce slug est revérifié ici contre le VRAI catalogue (jamais une chaîne libre acceptée
  // telle quelle). Un slug inconnu ou absent retombe silencieusement sur le don général PTH.
  const project = isValidProjectSlug(data.project) ? data.project : null;
  const paymentLink = provider === "stripe-link" ? donationPaymentLink({ amount: data.amount, frequency: data.frequency }) : "";
  if (provider === "stripe-link" && !paymentLink) {
    return fail("Ce montant n'est pas disponible pour ce type de don.", 422, "PAYMENT_LINK_UNAVAILABLE");
  }

  const leadData = { mode: "donate", ...data, amount: `${data.amount} €` };
  const lead = { mode: "donate", payload: leadData };
  const [stored] = await Promise.all([
    saveLead({ mode: "donate", data: leadData, ipHash, userAgent: request.headers.get("user-agent") }),
    notifyTeam(lead),
  ]);

  if (provider === "helloasso") return NextResponse.json({ ok: true, url: settings().donations.helloassoUrl });
  if (provider === "stripe-link") return NextResponse.json({ ok: true, url: paymentLink });

  const pending = await createPendingPayment({
    internalReference: idempotencyKey,
    donationType: data.frequency,
    amountCents,
    donorEmail: data.email,
    donorName: name,
    leadId: stored.ok ? stored.id : null,
    project,
  });
  if (!pending.ok && pending.error && pending.error !== "no_backend") {
    console.error("[donate] enregistrement « en attente » échoué :", pending.error);
  }

  const session = await createDonationCheckout({
    amountCents,
    donationType: data.frequency,
    email: data.email,
    name,
    internalReference: idempotencyKey,
    idempotencyKey,
    project,
  });
  if (!session.ok) {
    console.error("[donate] Stripe :", session.error);
    return fail("Le paiement n'a pas pu démarrer. Réessayez dans un instant.", 502, session.code || "STRIPE_ERROR");
  }

  await attachCheckoutSession(idempotencyKey, session.id);
  return NextResponse.json({ ok: true, url: session.url });
}
