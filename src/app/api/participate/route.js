import { NextResponse } from "next/server";
import { participationSchema } from "../../../lib/forms/schemas.js";
import { clientIp, hashIp, sameOrigin, rateLimit } from "../../../lib/server/security.js";
import { verifyTurnstile } from "../../../lib/server/turnstile.js";
import { saveLead, countRecentLeads } from "../../../lib/server/leads.js";
import { notifyTeam, confirmToVisitor } from "../../../lib/server/emails.js";

/**
 * POST /api/participate — le formulaire du site.
 * Chaîne : taille → origine → champ piège → validation (zod) → Turnstile → limitation de débit
 *          → enregistrement en base ET email à l'équipe → confirmation au visiteur.
 * Réussite = au moins UN canal a fonctionné (base ou email) : une demande n'est jamais perdue si l'autre est en panne.
 */

const MAX_BYTES = 20_000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const fail = (error, status) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request) {
  if (!sameOrigin(request)) return fail("Origine refusée.", 403);

  const raw = await request.text();
  if (raw.length > MAX_BYTES) return fail("Requête trop volumineuse.", 413);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail("Requête invalide.", 400);
  }

  // Champ piège rempli = robot : faux succès, rien n'est enregistré ni envoyé. Testé AVANT la validation
  // (une erreur apprendrait au robot qu'il a été repéré).
  if (typeof payload?.website === "string" && payload.website.trim() !== "") return NextResponse.json({ ok: true });

  const parsed = participationSchema.safeParse(payload);
  if (!parsed.success) return fail("Données invalides.", 422);

  const ip = clientIp(request);
  const ipHash = hashIp(ip);

  const human = await verifyTurnstile(payload.turnstileToken, ip);
  if (!human.ok) return fail(human.error === "unavailable" ? "Vérification indisponible, réessayez." : "Vérification anti-robot échouée.", human.error === "unavailable" ? 503 : 400);

  if (rateLimit(`participate:${ipHash}`, { windowMs: WINDOW_MS, max: MAX_PER_WINDOW }) || (await countRecentLeads(ipHash, WINDOW_MS)) >= MAX_PER_WINDOW) {
    return fail("Trop de tentatives. Réessayez dans quelques minutes.", 429);
  }

  const { mode, website: _honeypot, ...data } = parsed.data;
  const lead = { mode, payload: { mode, ...data } };
  const [stored, mailed] = await Promise.all([
    saveLead({ mode, data: lead.payload, ipHash, userAgent: request.headers.get("user-agent") }),
    notifyTeam(lead),
  ]);

  if (!stored.ok && !mailed.ok) {
    console.error("[participate] aucun canal disponible", { base: stored.error, email: mailed.error });
    return fail("Envoi impossible.", 502);
  }
  if (!stored.ok && stored.error !== "no_backend") console.error("[participate] enregistrement échoué :", stored.error);
  if (!mailed.ok) console.error("[participate] email d'équipe échoué :", mailed.error);

  // Confirmation au visiteur : utile mais jamais bloquante.
  await confirmToVisitor(lead).catch(() => {});
  return NextResponse.json({ ok: true });
}
