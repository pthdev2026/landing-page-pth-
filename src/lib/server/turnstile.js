import { settings } from "./config.js";

/**
 * Cloudflare Turnstile (anti-robots invisible). Sans TURNSTILE_SECRET_KEY, la vérification est désactivée (`skipped`).
 * Si Cloudflare est injoignable, on refuse (`unavailable`) plutôt que d'ouvrir la porte aux robots.
 */
export async function verifyTurnstile(token, ip, fetchImpl = fetch) {
  const { secret } = settings().turnstile;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, error: "missing" };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = await res.json();
    return json.success ? { ok: true } : { ok: false, error: (json["error-codes"] || []).join(",") || "failed" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
