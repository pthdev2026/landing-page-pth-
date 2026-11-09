import { Resend } from "resend";
import { emails, fill } from "../../content/emails.js";
import { fieldsByMode, modeLabels } from "../forms/fields.js";
import { settings, isProd } from "./config.js";
import { escapeHtml, oneLine } from "./security.js";
import { leadName } from "./leads.js";

/**
 * Emails transactionnels (Resend). Gabarits HTML « tableaux + styles en ligne » : c'est le seul format que tous les
 * clients mail (Gmail, Outlook, Apple Mail) affichent correctement. Chaque email a une version texte brut.
 * Sans clé Resend : journal en développement, erreur explicite en production (jamais de perte silencieuse).
 */

const C = { bg: "#050505", card: "#0d0a0a", line: "#241a1a", text: "#f2f2f4", dim: "#a6a6ad", red: "#d3262f" };

function shell({ preheader, body, footer }) {
  const { siteUrl } = settings();
  const local = /localhost|127\.0\.0\.1/.test(siteUrl);
  const brand = local
    ? `<span style="font:800 26px Arial,sans-serif;letter-spacing:6px;color:${C.text}">PTH</span>`
    : `<img src="${siteUrl}/brand/logo-pth.png" width="96" alt="PTH" style="display:block;border:0;height:auto">`;
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 24px">${brand}</td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:32px;font:16px/1.6 Arial,Helvetica,sans-serif;color:${C.text}">${body}</td></tr>
<tr><td style="padding:20px 8px 0;font:12px/1.5 Arial,Helvetica,sans-serif;color:${C.dim}">${escapeHtml(footer ?? emails.tagline)}</td></tr>
</table></td></tr></table></body></html>`;
}

const nl2br = (v) => escapeHtml(v).replace(/\n/g, "<br>");
const labelFor = (mode, key) => fieldsByMode[mode]?.find((f) => f.name === key)?.label ?? key;

function recapRows(mode, payload) {
  return Object.entries(payload)
    .filter(([key, value]) => key !== "mode" && String(value ?? "").trim() !== "")
    .map(([key, value]) => ({ label: labelFor(mode, key), value: String(value) }));
}

/** Email pour l'équipe. `Reply-To` = le visiteur : « Répondre » lui écrit directement. */
export function renderTeamEmail({ mode, payload, adminUrl }) {
  const name = leadName(payload) || payload.email;
  const rows = recapRows(mode, payload);
  const subject = oneLine(fill(emails.team.subject, { mode: modeLabels[mode], name }), 180);
  const table = rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;border-top:1px solid ${C.line};vertical-align:top;width:38%;font:12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${C.dim}">${escapeHtml(r.label)}</td><td style="padding:8px 0;border-top:1px solid ${C.line};vertical-align:top">${nl2br(r.value)}</td></tr>`,
    )
    .join("");
  const html = shell({
    preheader: emails.team.preheader,
    body: `<p style="margin:0 0 4px;color:${C.red};font:700 12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">${escapeHtml(modeLabels[mode])}</p>
<p style="margin:0 0 20px;font-size:20px">${escapeHtml(emails.team.intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${table}</table>
<p style="margin:20px 0 0;font-size:13px;color:${C.dim}">${escapeHtml(emails.team.replyHint)}${adminUrl ? ` · <a href="${escapeHtml(adminUrl)}" style="color:${C.text}">${escapeHtml(emails.team.adminLink)}</a>` : ""}</p>`,
  });
  const text = `${emails.team.intro}\n\n${rows.map((r) => `${r.label} : ${r.value}`).join("\n")}\n\n${emails.team.replyHint}`;
  return { subject, html, text };
}

/** Confirmation automatique envoyée au visiteur. */
export function renderConfirmationEmail({ mode, payload }) {
  const c = emails.confirmation;
  const name = payload.firstName || payload.name || "";
  const rows = recapRows(mode, payload).filter((r) => r.label !== labelFor(mode, "email"));
  const recap = rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0;vertical-align:top;width:38%;font:12px Arial,sans-serif;color:${C.dim}">${escapeHtml(r.label)}</td><td style="padding:6px 0;vertical-align:top;color:${C.text}">${nl2br(r.value)}</td></tr>`,
    )
    .join("");
  const html = shell({
    preheader: c.preheader,
    footer: c.footer,
    body: `<p style="margin:0 0 16px">${escapeHtml(fill(c.greeting, { name }))}</p>
<p style="margin:0 0 24px">${escapeHtml(fill(c.body, { mode: modeLabels[mode].toLowerCase() }))}</p>
<p style="margin:0 0 8px;color:${C.dim};font:700 12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">${escapeHtml(c.recapTitle)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}">${recap}</table>
<p style="margin:24px 0 0">${escapeHtml(c.signature)}</p>`,
  });
  const text = `${fill(c.greeting, { name })}\n\n${fill(c.body, { mode: modeLabels[mode].toLowerCase() })}\n\n${c.recapTitle} :\n${rows.map((r) => `- ${r.label} : ${r.value}`).join("\n")}\n\n${c.signature}`;
  return { subject: c.subject, html, text };
}

/** Remerciement après un don confirmé par le prestataire de paiement. */
export function renderDonationEmail({ name, amountCents, currency = "eur", frequency }) {
  const d = emails.donation;
  const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(amountCents / 100);
  const values = { name: name || "", amount, frequency: frequency === "monthly" ? d.frequencyMonthly : "" };
  const html = shell({
    preheader: d.preheader,
    body: `<p style="margin:0 0 16px">${escapeHtml(fill(d.greeting, values))}</p><p style="margin:0 0 24px">${escapeHtml(fill(d.body, values))}</p><p style="margin:0">${escapeHtml(d.signature)}</p>`,
  });
  const text = `${fill(d.greeting, values)}\n\n${fill(d.body, values)}\n\n${d.signature}`;
  return { subject: d.subject, html, text };
}

/** Envoi. Renvoie `{ ok, dev? , error? }` ; ne lève jamais. */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const { resend } = settings();
  if (!resend.apiKey || !to) {
    if (!isProd()) {
      console.info(`[email:dev] → ${to || "(pas de destinataire)"} · ${subject}`);
      return { ok: true, dev: true };
    }
    return { ok: false, error: "Email non configuré" };
  }
  try {
    const { error } = await new Resend(resend.apiKey).emails.send({ from: resend.from, to, replyTo, subject: oneLine(subject, 200), html, text });
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export const notifyTeam = (lead) => {
  const { resend, siteUrl } = settings();
  return sendMail({ to: resend.to, replyTo: lead.payload.email, ...renderTeamEmail({ ...lead, adminUrl: `${siteUrl}/admin` }) });
};
export const confirmToVisitor = (lead) => sendMail({ to: lead.payload.email, ...renderConfirmationEmail(lead) });
export const thankDonor = (donation) => sendMail({ to: donation.email, ...renderDonationEmail(donation) });
