import { settings, isProd } from "./config.js";
import { signToken, verifyToken } from "./security.js";

/**
 * Espace admin : un mot de passe (ADMIN_PASSWORD) + un secret de signature (ADMIN_SESSION_SECRET, ≥ 16 caractères).
 * La session est un cookie HttpOnly / SameSite=Strict / Secure (en production) contenant un jeton signé qui expire en 8 h.
 * Sans ces deux variables, l'espace admin n'existe pas (404) : rien n'est exposé par défaut.
 */
export const ADMIN_COOKIE = "pth_admin";
export const SESSION_MS = 8 * 60 * 60_000;

export function adminEnabled() {
  const { admin } = settings();
  return Boolean(admin.password && admin.secret && admin.secret.length >= 16);
}

export const createSession = (now = Date.now()) => signToken({ sub: "admin", exp: now + SESSION_MS }, settings().admin.secret);

export function isAuthorized(token) {
  return adminEnabled() && verifyToken(token, settings().admin.secret)?.sub === "admin";
}

export const cookieOptions = () => ({ httpOnly: true, secure: isProd(), sameSite: "strict", path: "/", maxAge: SESSION_MS / 1000 });
