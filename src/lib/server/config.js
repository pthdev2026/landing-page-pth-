/**
 * Configuration serveur : TOUT vient de variables d'environnement, lues à l'appel (jamais figées à l'import),
 * pour que les tests puissent les changer. Aucune clé n'est jamais dans le code ni dans la conversation.
 * Voir `.env.example` et `docs/19-backend.md`.
 */
const env = (key) => (process.env[key] ?? "").trim();
const stripeLink = (key) => {
  const value = env(key);
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "buy.stripe.com" || url.hostname === "donate.stripe.com") ? url.toString() : "";
  } catch {
    return "";
  }
};

export const isProd = () => process.env.NODE_ENV === "production";

export function settings() {
  return {
    siteUrl: (env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000").replace(/\/$/, ""),
    resend: { apiKey: env("RESEND_API_KEY"), to: env("PTH_CONTACT_EMAIL"), from: env("PTH_FROM_EMAIL") || "onboarding@resend.dev" },
    supabase: { url: env("SUPABASE_URL").replace(/\/$/, ""), serviceKey: env("SUPABASE_SERVICE_ROLE_KEY") },
    turnstile: { secret: env("TURNSTILE_SECRET_KEY") },
    stripe: {
      secret: env("STRIPE_SECRET_KEY"),
      webhookSecret: env("STRIPE_WEBHOOK_SECRET"),
      apiBase: (env("STRIPE_API_BASE") || "https://api.stripe.com").replace(/\/$/, ""),
      paymentLinks: {
        once: {
          20: stripeLink("STRIPE_DONATION_ONCE_20_URL"),
          50: stripeLink("STRIPE_DONATION_ONCE_50_URL"),
          100: stripeLink("STRIPE_DONATION_ONCE_100_URL"),
          150: stripeLink("STRIPE_DONATION_ONCE_150_URL"),
          custom: stripeLink("STRIPE_DONATION_ONCE_CUSTOM_URL"),
        },
        monthly: {
          20: stripeLink("STRIPE_DONATION_MONTHLY_20_URL"),
          50: stripeLink("STRIPE_DONATION_MONTHLY_50_URL"),
          100: stripeLink("STRIPE_DONATION_MONTHLY_100_URL"),
          150: stripeLink("STRIPE_DONATION_MONTHLY_150_URL"),
        },
      },
    },
    donations: { provider: env("DONATION_PROVIDER") || "none", helloassoUrl: env("HELLOASSO_DONATION_URL") },
    // Page /projets (brief du 2026-10-18), bloc « Devenir partenaire » : coordonnées fournies par PTH, jamais
    // inventées — le bouton correspondant se masque proprement si la variable est vide (voir ProjectsSupport.jsx).
    projects: { contactEmail: env("PTH_PROJECT_CONTACT_EMAIL"), calendarUrl: env("PTH_CALENDAR_URL") },
    admin: { password: env("ADMIN_PASSWORD"), secret: env("ADMIN_SESSION_SECRET") },
    ipSalt: env("IP_HASH_SALT") || env("ADMIN_SESSION_SECRET") || "pth-dev-salt",
  };
}

/** Fournisseur de dons réellement utilisable : liens Stripe, Checkout dynamique, HelloAsso ou aucun. */
export function donationProvider() {
  const { donations, stripe } = settings();
  const hasPaymentLink = [...Object.values(stripe.paymentLinks.once), ...Object.values(stripe.paymentLinks.monthly)].some(Boolean);
  if (donations.provider === "stripe" && hasPaymentLink) return "stripe-link";
  if (donations.provider === "stripe" && stripe.secret) return "stripe";
  if (donations.provider === "helloasso" && donations.helloassoUrl) return "helloasso";
  return "none";
}

/** URL Stripe autorisée pour le montant et le rythme choisis. Les montants non listés ponctuels utilisent le lien libre. */
export function donationPaymentLink({ amount, frequency }) {
  const { stripe } = settings();
  const links = stripe.paymentLinks[frequency];
  if (!links) return "";
  return links[amount] || (frequency === "once" ? links.custom : "");
}
