import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAuthorized } from "../../../../lib/server/admin.js";
import { sameOrigin } from "../../../../lib/server/security.js";
import { setLeadStatus } from "../../../../lib/server/leads.js";

/** POST /api/admin/leads — change le statut d'une demande ({ id, status }). Réservé à l'admin connecté. */
export async function POST(request) {
  if (!isAuthorized(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: "Origine refusée." }, { status: 403 });
  const { id, status } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !id) return NextResponse.json({ ok: false, error: "Identifiant manquant." }, { status: 400 });
  const result = await setLeadStatus(id, status);
  return NextResponse.json(result, { status: result.ok ? 200 : result.error === "not_found" ? 404 : 400 });
}
