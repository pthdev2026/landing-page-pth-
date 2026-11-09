import { NextResponse } from "next/server";
import { settings } from "../../../../lib/server/config.js";
import { adminEnabled, ADMIN_COOKIE, createSession, cookieOptions } from "../../../../lib/server/admin.js";
import { clientIp, hashIp, rateLimit, safeEqual, sameOrigin } from "../../../../lib/server/security.js";

/** POST /api/admin/login — 5 essais / 10 min par empreinte d'IP, comparaison en temps constant, délai sur échec. */
export async function POST(request) {
  if (!adminEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: "Origine refusée." }, { status: 403 });
  if (rateLimit(`admin:${hashIp(clientIp(request))}`, { windowMs: 10 * 60_000, max: 5 })) {
    return NextResponse.json({ ok: false, error: "Trop d'essais. Réessayez dans quelques minutes." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  if (!safeEqual(body?.password ?? "", settings().admin.password)) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // ralentit les essais en série
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSession(), cookieOptions());
  return response;
}
