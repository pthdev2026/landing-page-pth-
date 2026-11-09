"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Connexion à l'espace admin (mot de passe unique). */
export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(json.error || "Connexion impossible.");
  }

  return (
    <main className="mx-auto grid min-h-svh max-w-sm place-items-center px-6">
      <form onSubmit={submit} className="w-full">
        <h1 className="font-sans text-3xl font-normal tracking-[-0.04em] text-silver">Administration</h1>
        <label htmlFor="pw" className="mt-8 block text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
          Mot de passe
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-b border-ivory/30 bg-transparent py-3 text-ivory outline-none focus:border-champagne"
        />
        {error ? (
          <p role="alert" className="mt-3 text-sm text-flare">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-[length:var(--text-small)] font-medium text-ink disabled:opacity-50"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
