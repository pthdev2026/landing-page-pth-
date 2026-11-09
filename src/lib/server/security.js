import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { settings } from "./config.js";

/** Outils de sécurité serveur : IP anonymisée, origine, échappement, jetons signés, signature Stripe, limitation de débit. */

export function clientIp(request) {
  const h = request.headers;
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** RGPD : on ne stocke jamais l'adresse IP, seulement une empreinte salée (suffisante pour limiter les abus). */
export function hashIp(ip) {
  return createHash("sha256").update(`${settings().ipSalt}:${ip}`).digest("hex").slice(0, 32);
}

/** Refuse un POST venu d'un autre site (CSRF). Sans en-tête Origin (outils en ligne de commande), on laisse passer : d'autres garde-fous suivent. */
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    const own = request.headers.get("x-forwarded-host") || request.headers.get("host");
    return host === own || host === new URL(settings().siteUrl).host;
  } catch {
    return false;
  }
}

const HTML = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => HTML[c]);

/** Une seule ligne, sans retour chariot : empêche l'injection d'en-têtes d'email via un sujet ou un nom. */
export const oneLine = (value, max = 200) => String(value ?? "").replace(/[\r\n\u2028\u2029]+/g, " ").trim().slice(0, max);

/** Comparaison en temps constant (mot de passe, jetons) : ne révèle rien par le temps de réponse. */
export function safeEqual(a, b) {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

/** Jeton signé (HMAC-SHA256) : `charge.signature`, avec expiration `exp` (ms). Sert de session admin. */
export function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token, secret, now = Date.now()) {
  if (!token || !secret || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Vérifie l'en-tête `Stripe-Signature` (schéma v1 : HMAC-SHA256 de `t.corps`) avec tolérance d'horloge de 5 minutes. */
export function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  if (!t || Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return header
    .split(",")
    .filter((kv) => kv.trim().startsWith("v1="))
    .some((kv) => {
      const given = kv.trim().slice(3);
      return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
    });
}

// Limitation de débit en mémoire (par instance) : première barrière, sans dépendance. Le stockage prend le relais (voir leads.js).
const buckets = new Map();
export function rateLimit(key, { windowMs = 10 * 60_000, max = 5 } = {}, now = Date.now()) {
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return recent.length > max;
}
export const resetRateLimits = () => buckets.clear();
