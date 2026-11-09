import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAuthorized } from "../../../../lib/server/admin.js";
import { listLeads } from "../../../../lib/server/leads.js";
import { modeLabels } from "../../../../lib/forms/fields.js";

/** GET /api/admin/export — toutes les demandes en CSV (séparateur « ; » pour Excel en français). Réservé à l'admin. */
const cell = (value) => {
  let s = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@\t]/.test(s)) s = `'${s}`; // neutralise l'injection de formules (Excel / Sheets)
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request) {
  if (!isAuthorized(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: false }, { status: 401 });
  const leads = await listLeads({ limit: 5000 });
  const header = ["Date", "Type", "Nom", "Email", "Statut", "Message", "Détails (JSON)"];
  const rows = leads.map((l) => [l.created_at, modeLabels[l.mode] ?? l.mode, l.name, l.email, l.status, l.payload?.message ?? "", JSON.stringify(l.payload ?? {})]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pth-demandes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
