"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LABELS = { new: "Nouvelle", contacted: "Traitée", archived: "Archivée" };

/** Boutons de statut d'une demande : appellent l'API puis rafraîchissent la liste. */
export default function LeadStatus({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function set(next) {
    setBusy(next);
    await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: next }) });
    setBusy("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(LABELS).map(([key, label]) => (
        <button
          key={key}
          type="button"
          disabled={status === key || Boolean(busy)}
          onClick={() => set(key)}
          className={`rounded-full border px-4 py-1.5 text-[length:var(--text-small)] transition-colors ${status === key ? "border-ivory bg-ivory text-ink" : "border-ivory/25 text-ivory hover:border-ivory/55"} disabled:cursor-default`}
        >
          {busy === key ? "…" : label}
        </button>
      ))}
    </div>
  );
}
