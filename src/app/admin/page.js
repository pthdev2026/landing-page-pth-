import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, adminEnabled, isAuthorized } from "../../lib/server/admin.js";
import { backend, listPayments, listLeads } from "../../lib/server/leads.js";
import { fieldsByMode, modeLabels } from "../../lib/forms/fields.js";
import AdminLogin from "../../components/admin/AdminLogin.jsx";
import AdminLogout from "../../components/admin/AdminLogout.jsx";
import LeadStatus from "../../components/admin/LeadStatus.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administration", robots: { index: false, follow: false } };

const STATUS = { new: "Nouvelle", contacted: "Traitée", archived: "Archivée" };
const BACKEND = { supabase: "Supabase", local: "Fichier local (développement)", none: "Aucune base configurée" };
const labelFor = (mode, key) => fieldsByMode[mode]?.find((f) => f.name === key)?.label ?? { frequency: "Rythme", amount: "Montant" }[key] ?? key;
const date = (iso) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
const money = (cents, currency = "eur") => new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format((cents || 0) / 100);

function Filter({ href, active, children }) {
  return (
    <a href={href} className={`rounded-full border px-4 py-1.5 text-[length:var(--text-small)] transition-colors ${active ? "border-ivory bg-ivory text-ink" : "border-ivory/25 text-ivory hover:border-ivory/55"}`}>
      {children}
    </a>
  );
}

/** Espace admin : demandes du formulaire et dons. Invisible (404) tant que ADMIN_PASSWORD / ADMIN_SESSION_SECRET ne sont pas définis. */
export default async function AdminPage({ searchParams }) {
  if (!adminEnabled()) notFound();
  const store = await cookies();
  if (!isAuthorized(store.get(ADMIN_COOKIE)?.value)) return <AdminLogin />;

  const sp = await searchParams;
  const mode = Object.keys(modeLabels).includes(sp?.mode) ? sp.mode : undefined;
  const status = Object.keys(STATUS).includes(sp?.status) ? sp.status : undefined;
  const [leads, payments, all] = await Promise.all([listLeads({ mode, status }), listPayments(), listLeads({ limit: 5000 })]);
  const count = (s) => all.filter((l) => l.status === s).length;
  const qs = (patch) => {
    const p = new URLSearchParams({ ...(mode ? { mode } : {}), ...(status ? { status } : {}), ...patch });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return `/admin${p.size ? `?${p}` : ""}`;
  };
  const paid = payments.filter((d) => d.status === "paid");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-4xl font-normal tracking-[-0.05em] text-silver">Demandes</h1>
          <p className="mt-2 text-[length:var(--text-small)] text-ivory-dim">Stockage : {BACKEND[backend()]}</p>
        </div>
        <div className="flex gap-3">
          <a href="/api/admin/export" className="rounded-full border border-ivory/25 px-5 py-2 text-[length:var(--text-small)] text-ivory transition-colors hover:border-ivory/55">
            Exporter en CSV
          </a>
          <AdminLogout />
        </div>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Nouvelles", count("new")],
          ["Traitées", count("contacted")],
          ["Archivées", count("archived")],
          ["Dons payés", `${paid.length} · ${money(paid.reduce((s, d) => s + d.amount_cents, 0))}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-card)] border border-ivory/15 p-4">
            <dt className="text-[length:var(--text-micro)] uppercase tracking-[0.2em] text-ivory-dim">{label}</dt>
            <dd className="mt-2 font-sans text-2xl tracking-[-0.04em]">{value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filtres" className="mt-10 flex flex-wrap gap-2">
        <Filter href={qs({ status: "" })} active={!status}>Tous les statuts</Filter>
        {Object.entries(STATUS).map(([k, v]) => (
          <Filter key={k} href={qs({ status: k })} active={status === k}>{v}</Filter>
        ))}
        <span className="mx-2 w-px bg-ivory/15" aria-hidden="true" />
        <Filter href={qs({ mode: "" })} active={!mode}>Tous les types</Filter>
        {Object.entries(modeLabels).map(([k, v]) => (
          <Filter key={k} href={qs({ mode: k })} active={mode === k}>{v}</Filter>
        ))}
      </nav>

      <ul className="mt-8 space-y-3">
        {leads.length === 0 ? <li className="text-ivory-dim">Aucune demande pour ce filtre.</li> : null}
        {leads.map((lead) => (
          <li key={lead.id} className="rounded-[var(--radius-card)] border border-ivory/15">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                <span className="w-28 text-[length:var(--text-small)] text-ivory-dim">{date(lead.created_at)}</span>
                <span className="rounded-full bg-ivory/10 px-3 py-0.5 text-[length:var(--text-micro)] uppercase tracking-[0.16em]">{modeLabels[lead.mode] ?? lead.mode}</span>
                <span className="font-medium">{lead.name || lead.email}</span>
                <span className="text-ivory-dim">{lead.email}</span>
                <span className={`ml-auto text-[length:var(--text-small)] ${lead.status === "new" ? "text-champagne" : "text-ivory-dim"}`}>{STATUS[lead.status] ?? lead.status}</span>
              </summary>
              <div className="border-t border-ivory/10 px-5 py-5">
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
                  {Object.entries(lead.payload ?? {})
                    .filter(([k, v]) => k !== "mode" && String(v ?? "").trim() !== "")
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-[length:var(--text-small)] text-ivory-dim">{labelFor(lead.mode, k)}</dt>
                        <dd className="whitespace-pre-wrap break-words">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <LeadStatus id={lead.id} status={lead.status} />
                  <a href={`mailto:${lead.email}`} className="text-[length:var(--text-small)] text-champagne underline underline-offset-4">Répondre par email</a>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 font-sans text-2xl font-normal tracking-[-0.04em] text-silver">Dons</h2>
      {payments.length === 0 ? (
        <p className="mt-4 text-ivory-dim">Aucun don enregistré pour l’instant.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[length:var(--text-small)]">
            <thead className="text-ivory-dim">
              <tr>{["Date", "Donateur", "Montant", "Rythme", "Statut"].map((h) => <th key={h} className="py-2 pr-4 font-normal">{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.map((d) => (
                <tr key={d.id} className="border-t border-ivory/10">
                  <td className="py-3 pr-4 text-ivory-dim">{date(d.created_at)}</td>
                  <td className="py-3 pr-4">{d.donor_name || d.donor_email}</td>
                  <td className="py-3 pr-4">{money(d.amount_cents, d.currency)}</td>
                  <td className="py-3 pr-4">{d.donation_type === "monthly" ? "Mensuel" : "Ponctuel"}</td>
                  <td className="py-3 pr-4">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
