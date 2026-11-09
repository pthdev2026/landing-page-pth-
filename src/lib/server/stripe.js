import { settings } from "./config.js";

/**
 * Stripe Checkout (page de paiement hébergée par Stripe : aucune donnée de carte ne transite par notre serveur).
 * Appel REST direct (formulaire encodé), sans SDK. `STRIPE_API_BASE` permet de pointer vers un faux serveur en test.
 *
 * Règles appliquées ici :
 *  - Montant libre des DEUX côtés (ponctuel ET mensuel) depuis le 2026-10-14 (demande utilisateur : « oui, montant
 *    libre aussi pour le mensuel »). Minimum et plafond vérifiés par l'appelant (`/api/donate`) AVANT d'arriver
 *    ici — cette fonction ne fait pas confiance au montant qu'on lui donne, mais la valeur de vérité reste la
 *    validation serveur dans la route.
 *  - Le prix est créé à la volée dans les deux cas (`price_data`) : pour le mensuel, avec `recurring: {interval:
 *    "month"}` — Stripe accepte un prix récurrent ad hoc en mode `subscription`, pas besoin de Price ID créés à
 *    l'avance dans le Dashboard (brief technique initial du 2026-10-13, assoupli le 2026-10-14).
 *  - Clé d'idempotence Stripe (`Idempotency-Key`) : la même clé envoyée deux fois renvoie la MÊME session, Stripe
 *    ne crée jamais deux sessions pour une seule tentative de paiement (double-clic, reprise réseau…).
 */

/** Encode un objet imbriqué à la façon de Stripe : `line_items[0][price_data][currency]=eur`. */
export function stripeForm(object) {
  const params = new URLSearchParams();
  const add = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((item, i) => add(`${key}[${i}]`, item));
    else if (typeof value === "object") for (const [k, v] of Object.entries(value)) add(`${key}[${k}]`, v);
    else params.append(key, String(value));
  };
  for (const [key, value] of Object.entries(object)) add(key, value);
  return params;
}

/**
 * Crée une session de paiement. Renvoie `{ ok, url?, id?, error? }`.
 * `idempotencyKey` : UUID v4 fourni par le navigateur (une seule tentative de paiement = une seule clé, réutilisée
 * si la requête est relancée). `internalReference` : même UUID, inscrit en métadonnée pour relier la session à
 * notre ligne `donation_payments` dès le webhook.
 */
export async function createDonationCheckout({ amountCents, donationType, email, name, internalReference, idempotencyKey, project }) {
  const { stripe, siteUrl } = settings();
  const monthly = donationType === "monthly";
  // Don fléché vers un projet précis (page /projets, 2026-10-18) : `project` est déjà un slug validé contre le
  // vrai catalogue par l'appelant (`/api/donate`) — jamais une chaîne libre du navigateur. `"general"` = don PTH
  // non fléché (comportement d'avant cette fonctionnalité, inchangé).
  const projectSlug = project || "general";
  const productLabel = project ? `Don pour ${project}` : "PTH";

  const lineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: amountCents,
      product_data: { name: monthly ? `Don mensuel — ${productLabel}` : `Don ponctuel — ${productLabel}` },
      ...(monthly ? { recurring: { interval: "month" } } : {}),
    },
  };

  const metadata = {
    app: "PTH",
    project: projectSlug,
    donation_type: monthly ? "monthly" : "once",
    amount_cents: String(amountCents),
    internal_reference: internalReference || "",
  };

  const body = stripeForm({
    mode: monthly ? "subscription" : "payment",
    locale: "fr",
    customer_email: email || undefined,
    submit_type: monthly ? undefined : "donate",
    success_url: `${siteUrl}/merci?session_id={CHECKOUT_SESSION_ID}&don=1`,
    // `#don` (pas `#participer`) : le don a son propre bloc depuis le 2026-10-13, ce n'est plus une entrée
    // du sélecteur générique « Comment souhaitez-vous participer ? ».
    cancel_url: `${siteUrl}/?don=annule#don`,
    line_items: [lineItem],
    metadata,
    // Sur un abonnement, les métadonnées de la Session ne sont PAS recopiées automatiquement sur l'abonnement
    // ni sur ses factures : on les redonne explicitement ici (le webhook `invoice.paid` en a besoin).
    subscription_data: monthly ? { metadata: { ...metadata, donor_name: name || "" } } : undefined,
  });

  try {
    const res = await fetch(`${stripe.apiBase}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripe.secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body,
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json?.error?.message || `stripe ${res.status}` };
    return { ok: true, url: json.url, id: json.id };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
