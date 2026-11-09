/** @type {import('next').NextConfig} */

// En-têtes de sécurité standard (sans CSP : le site utilise des scripts en ligne — JSON-LD, hydratation Next — qu'une CSP stricte casserait).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // HSTS : n'a d'effet qu'en HTTPS (le navigateur l'ignore en HTTP, donc sans risque en dev local) ; 1 an, sous-domaines inclus.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Isole la fenêtre des autres origines (protection Spectre) : sans impact connu ici (pas de popup tiers ni
  // d'échange window.opener — Turnstile et le paiement Stripe passent par iframe/redirection, pas par popup).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Médias : 1 semaine de cache + revalidation. Pas « immutable » : les fichiers gardent leur nom (ex. l'image HD du plateau les remplacera).
const mediaCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/media/:path*", headers: mediaCache },
      { source: "/brand/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
