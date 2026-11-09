import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { settings, isProd } from "./config.js";

/**
 * Stockage des demandes (« leads ») et des dons, derrière une interface unique :
 *   - "supabase" : base PostgreSQL hébergée (production). Accès par l'API REST avec la clé « service » (serveur uniquement).
 *   - "local"    : fichiers JSON-lines dans `.data/` (développement et tests uniquement, jamais en production).
 *   - "none"     : production sans base configurée → rien n'est enregistré (l'email reste alors le seul canal).
 * Schéma SQL : supabase/migrations/0001_init.sql
 */

export function backend() {
  const { supabase } = settings();
  if (supabase.url && supabase.serviceKey) return "supabase";
  return isProd() ? "none" : "local";
}

/* ─────────────── Adaptateur Supabase (REST, sans dépendance) ─────────────── */
async function sb(pathAndQuery, { method = "GET", body, prefer } = {}) {
  const { supabase } = settings();
  const res = await fetch(`${supabase.url}/rest/v1/${pathAndQuery}`, {
    method,
    headers: {
      apikey: supabase.serviceKey,
      Authorization: `Bearer ${supabase.serviceKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`supabase ${res.status}: ${detail.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ─────────────── Adaptateur local (dev/tests) ─────────────── */
// Fichiers de développement uniquement (jamais utilisés en production, voir `backend()`). `turbopackIgnore` : sans lui, Next
// croirait devoir embarquer TOUT le projet dans le serveur à cause de ce chemin calculé (déploiement alourdi).
const dataDir = () => process.env.PTH_DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), ".data");
async function readRows(file) {
  try {
    const text = await fs.readFile(path.join(dataDir(), file), "utf8");
    return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}
async function writeRows(file, rows) {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(path.join(dataDir(), file), rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
}

/** Nom affichable d'une demande (les formulaires n'ont pas tous les mêmes champs). */
export function leadName(data) {
  return data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || "";
}

export const LEAD_STATUSES = ["new", "contacted", "archived"];

/* ─────────────── API publique ─────────────── */

/** Enregistre une demande. Ne lève jamais : renvoie `{ ok, id?, backend, error? }`. */
export async function saveLead({ mode, data, ipHash, userAgent }) {
  const kind = backend();
  if (kind === "none") return { ok: false, backend: kind, error: "no_backend" };
  const { website: _honeypot, turnstileToken: _token, ...payload } = data;
  const row = {
    mode,
    name: leadName(payload),
    email: payload.email,
    payload,
    status: "new",
    ip_hash: ipHash,
    user_agent: String(userAgent || "").slice(0, 300),
  };
  try {
    if (kind === "supabase") {
      const [saved] = await sb("leads", { method: "POST", body: row, prefer: "return=representation" });
      return { ok: true, id: saved.id, backend: kind };
    }
    const local = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.appendFile(path.join(dataDir(), "leads.jsonl"), JSON.stringify(local) + "\n");
    return { ok: true, id: local.id, backend: kind };
  } catch (error) {
    return { ok: false, backend: kind, error: error.message };
  }
}

export async function listLeads({ mode, status, limit = 300 } = {}) {
  const kind = backend();
  if (kind === "none") return [];
  if (kind === "supabase") {
    const q = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(limit) });
    if (mode) q.set("mode", `eq.${mode}`);
    if (status) q.set("status", `eq.${status}`);
    return (await sb(`leads?${q}`)) || [];
  }
  const rows = await readRows("leads.jsonl");
  return rows
    .filter((r) => (!mode || r.mode === mode) && (!status || r.status === status))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, limit);
}

export async function setLeadStatus(id, status) {
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: "bad_status" };
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb(`leads?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
      return { ok: true };
    }
    const rows = await readRows("leads.jsonl");
    const target = rows.find((r) => r.id === id);
    if (!target) return { ok: false, error: "not_found" };
    target.status = status;
    await writeRows("leads.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Nombre de demandes récentes d'une même empreinte d'IP : limitation de débit qui survit aux redémarrages. */
export async function countRecentLeads(ipHash, sinceMs) {
  const kind = backend();
  const since = new Date(Date.now() - sinceMs).toISOString();
  try {
    if (kind === "supabase") {
      const rows = await sb(`leads?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(since)}&limit=50`);
      return rows.length;
    }
    if (kind === "local") return (await readRows("leads.jsonl")).filter((r) => r.ip_hash === ipHash && r.created_at >= since).length;
  } catch {
    // En cas de panne de la base, on ne bloque pas les visiteurs : la limitation en mémoire reste active.
  }
  return 0;
}

/* ─────────────── Dons ─────────────── */

export async function getDonationByRef(providerRef) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donations?provider_ref=eq.${encodeURIComponent(providerRef)}&limit=1`))?.[0] ?? null;
    return (await readRows("donations.jsonl")).find((r) => r.provider_ref === providerRef) ?? null;
  } catch {
    return null;
  }
}

/** Crée ou met à jour un don (idempotent sur `provider_ref` : Stripe peut renvoyer le même événement plusieurs fois). */
export async function upsertDonation(donation) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb("donations?on_conflict=provider_ref", { method: "POST", body: donation, prefer: "resolution=merge-duplicates" });
      return { ok: true };
    }
    const rows = await readRows("donations.jsonl");
    const i = rows.findIndex((r) => r.provider_ref === donation.provider_ref);
    if (i >= 0) rows[i] = { ...rows[i], ...donation };
    else rows.push({ id: randomUUID(), created_at: new Date().toISOString(), ...donation });
    await writeRows("donations.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function listDonations({ limit = 200 } = {}) {
  const kind = backend();
  if (kind === "none") return [];
  if (kind === "supabase") return (await sb(`donations?select=*&order=created_at.desc&limit=${limit}`)) || [];
  return (await readRows("donations.jsonl")).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}

/* ─────────────── Dons v2 : paiements / abonnements / événements webhook ───────────────
 * Schéma : supabase/migrations/0002_donation_payments.sql. Remplace `donations` ci-dessus comme chemin
 * RÉEL du module de dons Stripe (brief technique du 2026-10-13) — `donations` reste intacte et fonctionnelle
 * (rien n'est supprimé) mais n'est plus alimentée par les nouvelles routes.
 */

/** Crée l'enregistrement « en attente » AVANT d'appeler Stripe (jamais confiance au seul retour du navigateur). */
export async function createPendingPayment({ internalReference, donationType, amountCents, donorEmail, donorName, leadId, project }) {
  const kind = backend();
  const row = {
    internal_reference: internalReference,
    donation_type: donationType,
    amount_cents: amountCents,
    currency: "eur",
    status: "pending",
    donor_email: donorEmail || null,
    donor_name: donorName || null,
    lead_id: leadId || null,
    // Projet fléché (page /projets, 2026-10-18) : `null` = don général PTH, pas un projet précis.
    // Colonne ajoutée par `supabase/migrations/0003_donation_project.sql`.
    project: project || null,
  };
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    // Idempotent sur `internal_reference` (unique en base) : une tentative relancée avec la MÊME clé (double-clic,
    // reprise réseau) retrouve la ligne déjà créée au lieu d'en créer une seconde.
    const existing = await getPaymentByInternalReference(internalReference);
    if (existing) return { ok: true, id: existing.id, duplicate: true };
    if (kind === "supabase") {
      const [saved] = await sb("donation_payments?on_conflict=internal_reference", {
        method: "POST",
        body: row,
        prefer: "resolution=merge-duplicates,return=representation",
      });
      return { ok: true, id: saved.id };
    }
    const now = new Date().toISOString();
    const local = { id: randomUUID(), created_at: now, updated_at: now, ...row };
    const rows = await readRows("donation_payments.jsonl");
    rows.push(local);
    await writeRows("donation_payments.jsonl", rows);
    return { ok: true, id: local.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function getPaymentByInternalReference(internalReference) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donation_payments?internal_reference=eq.${encodeURIComponent(internalReference)}&limit=1`))?.[0] ?? null;
    return (await readRows("donation_payments.jsonl")).find((r) => r.internal_reference === internalReference) ?? null;
  } catch {
    return null;
  }
}

/** Associe l'identifiant de Checkout Session Stripe à la ligne « en attente » déjà créée. */
export async function attachCheckoutSession(internalReference, stripeCheckoutSessionId) {
  return patchPaymentByRef(internalReference, { stripe_checkout_session_id: stripeCheckoutSessionId });
}

async function patchPaymentByRef(internalReference, patch) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb(`donation_payments?internal_reference=eq.${encodeURIComponent(internalReference)}`, { method: "PATCH", body: patch });
      return { ok: true };
    }
    const rows = await readRows("donation_payments.jsonl");
    const i = rows.findIndex((r) => r.internal_reference === internalReference);
    if (i < 0) return { ok: false, error: "not_found" };
    rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
    await writeRows("donation_payments.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function getPaymentByCheckoutSession(sessionId) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donation_payments?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}&limit=1`))?.[0] ?? null;
    return (await readRows("donation_payments.jsonl")).find((r) => r.stripe_checkout_session_id === sessionId) ?? null;
  } catch {
    return null;
  }
}

/** Retrouve un paiement par son PaymentIntent Stripe (utilisé par `charge.refunded`, qui ne connaît que lui). */
export async function getPaymentByPaymentIntent(paymentIntentId) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donation_payments?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}&limit=1`))?.[0] ?? null;
    return (await readRows("donation_payments.jsonl")).find((r) => r.stripe_payment_intent_id === paymentIntentId) ?? null;
  } catch {
    return null;
  }
}

export async function getPaymentByInvoiceId(invoiceId) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donation_payments?stripe_invoice_id=eq.${encodeURIComponent(invoiceId)}&limit=1`))?.[0] ?? null;
    return (await readRows("donation_payments.jsonl")).find((r) => r.stripe_invoice_id === invoiceId) ?? null;
  } catch {
    return null;
  }
}

/** Marque un paiement par Checkout Session (don ponctuel et toute première mensualité). */
export async function updatePaymentByCheckoutSession(sessionId, patch) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb(`donation_payments?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}`, { method: "PATCH", body: patch });
      return { ok: true };
    }
    const rows = await readRows("donation_payments.jsonl");
    const i = rows.findIndex((r) => r.stripe_checkout_session_id === sessionId);
    if (i < 0) return { ok: false, error: "not_found" };
    rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
    await writeRows("donation_payments.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Met à jour une ligne de paiement déjà existante, retrouvée par son identifiant de facture Stripe. */
export async function updatePaymentByInvoiceId(invoiceId, patch) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb(`donation_payments?stripe_invoice_id=eq.${encodeURIComponent(invoiceId)}`, { method: "PATCH", body: patch });
      return { ok: true };
    }
    const rows = await readRows("donation_payments.jsonl");
    const i = rows.findIndex((r) => r.stripe_invoice_id === invoiceId);
    if (i < 0) return { ok: false, error: "not_found" };
    rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
    await writeRows("donation_payments.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/** Crée une ligne de paiement pour une mensualité (`invoice.paid`/`invoice.payment_failed`) — pas de Checkout Session pour celles-ci. */
export async function recordInvoicePayment(row) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  const existing = await getPaymentByInvoiceId(row.stripe_invoice_id);
  if (existing) return { ok: true, id: existing.id, duplicate: true }; // unicité de stripe_invoice_id : jamais deux fois
  try {
    if (kind === "supabase") {
      const [saved] = await sb("donation_payments", { method: "POST", body: { internal_reference: randomUUID(), ...row }, prefer: "return=representation" });
      return { ok: true, id: saved.id };
    }
    const now = new Date().toISOString();
    const local = { id: randomUUID(), internal_reference: randomUUID(), created_at: now, updated_at: now, ...row };
    const rows = await readRows("donation_payments.jsonl");
    rows.push(local);
    await writeRows("donation_payments.jsonl", rows);
    return { ok: true, id: local.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function listPayments({ limit = 200 } = {}) {
  const kind = backend();
  if (kind === "none") return [];
  if (kind === "supabase") return (await sb(`donation_payments?select=*&order=created_at.desc&limit=${limit}`)) || [];
  return (await readRows("donation_payments.jsonl")).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}

/** Abonnements (dons mensuels) : état courant, synchronisé par `customer.subscription.*`. */
export async function upsertSubscription(sub) {
  const kind = backend();
  if (kind === "none") return { ok: false, error: "no_backend" };
  try {
    if (kind === "supabase") {
      await sb("donation_subscriptions?on_conflict=stripe_subscription_id", { method: "POST", body: sub, prefer: "resolution=merge-duplicates" });
      return { ok: true };
    }
    const rows = await readRows("donation_subscriptions.jsonl");
    const i = rows.findIndex((r) => r.stripe_subscription_id === sub.stripe_subscription_id);
    const now = new Date().toISOString();
    if (i >= 0) rows[i] = { ...rows[i], ...sub, updated_at: now };
    else rows.push({ id: randomUUID(), created_at: now, updated_at: now, ...sub });
    await writeRows("donation_subscriptions.jsonl", rows);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function getSubscription(stripeSubscriptionId) {
  const kind = backend();
  if (kind === "none") return null;
  try {
    if (kind === "supabase") return (await sb(`donation_subscriptions?stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}&limit=1`))?.[0] ?? null;
    return (await readRows("donation_subscriptions.jsonl")).find((r) => r.stripe_subscription_id === stripeSubscriptionId) ?? null;
  } catch {
    return null;
  }
}

/* ─────────────── Déduplication des événements webhook Stripe ─────────────── */

/** `true` si cet `event.id` a déjà été traité avec succès (empêche tout double traitement). */
export async function isWebhookEventProcessed(eventId) {
  const kind = backend();
  if (kind === "none") return false; // pas de base : on ne peut pas savoir, mieux vaut laisser traiter (pas de perte silencieuse)
  try {
    const row =
      kind === "supabase"
        ? (await sb(`stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(eventId)}&limit=1`))?.[0]
        : (await readRows("stripe_webhook_events.jsonl")).find((r) => r.stripe_event_id === eventId);
    return row?.processing_status === "done";
  } catch {
    return false;
  }
}

/** Enregistre l'événement AVANT traitement (statut « processing »), pour qu'un crash au milieu ne le fasse pas disparaître. */
export async function recordWebhookEventStart(eventId, eventType) {
  const kind = backend();
  if (kind === "none") return;
  const row = { stripe_event_id: eventId, event_type: eventType, processing_status: "processing", created_at: new Date().toISOString() };
  try {
    if (kind === "supabase") {
      await sb("stripe_webhook_events?on_conflict=stripe_event_id", { method: "POST", body: row, prefer: "resolution=merge-duplicates" });
      return;
    }
    const rows = await readRows("stripe_webhook_events.jsonl");
    if (!rows.some((r) => r.stripe_event_id === eventId)) {
      rows.push(row);
      await writeRows("stripe_webhook_events.jsonl", rows);
    }
  } catch {
    // Panne de journalisation : ne bloque pas le traitement du paiement, qui reste l'essentiel.
  }
}

/** Referme l'événement (« done » ou « error ») une fois le traitement terminé. */
export async function recordWebhookEventEnd(eventId, status, errorMessage) {
  const kind = backend();
  if (kind === "none") return;
  const patch = { processing_status: status, processed_at: new Date().toISOString(), error_message: errorMessage || null };
  try {
    if (kind === "supabase") {
      await sb(`stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(eventId)}`, { method: "PATCH", body: patch });
      return;
    }
    const rows = await readRows("stripe_webhook_events.jsonl");
    const i = rows.findIndex((r) => r.stripe_event_id === eventId);
    if (i >= 0) {
      rows[i] = { ...rows[i], ...patch };
      await writeRows("stripe_webhook_events.jsonl", rows);
    }
  } catch {
    // idem : ne jamais faire échouer le webhook pour un souci de journalisation.
  }
}
