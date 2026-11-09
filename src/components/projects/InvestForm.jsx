"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { form as formCopy, projectsPage as copy } from "@/content/fr";
import { donationCheckoutSchema } from "@/lib/forms/schemas";
import { track } from "@/lib/analytics";
import Turnstile from "@/components/form/Turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const DONATIONS = process.env.NEXT_PUBLIC_DONATIONS_ENABLED === "true";

// Pavé du clavier numérique custom (don ponctuel) — "" = case vide (alignement façon clavier de téléphone).
const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

function BackspaceIcon() {
  return (
    <svg aria-hidden="true" width="20" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9l-7-8 7-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 9l6 6M20 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Formulaire de don unique de /projets (brief revu le 2026-10-20) — plus de sélecteur de projet : un seul don,
 * fléché PTH par défaut (ou vers `project` si fourni, ex. depuis une fiche `/projets/[slug]`, voir
 * `ProjectDetail.jsx`). Don ponctuel = montant libre uniquement ; don mensuel = montants fixes (demande
 * explicite : deux formes différentes, pas la même grille de montants pour les deux — jamais de « conseillé »
 * cette fois).
 */
export default function InvestForm({ project = null }) {
  const s = copy.support.finance;
  const [status, setStatus] = useState("idle");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [frequency, setFrequency] = useState("monthly");
  const [monthlyAmount, setMonthlyAmount] = useState(s.monthlyAmounts[0]);
  const [onceAmount, setOnceAmount] = useState("");
  const [problem, setProblem] = useState("");
  const [started, setStarted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(donationCheckoutSchema),
    defaultValues: { website: "", amount: s.monthlyAmounts[0], message: "" },
  });

  useEffect(() => {
    const value = frequency === "monthly" ? monthlyAmount : Number(onceAmount.replace(",", "."));
    setValue("amount", Number.isFinite(value) ? value : undefined, { shouldValidate: false });
  }, [frequency, monthlyAmount, onceAmount, setValue]);

  const onStart = () => {
    if (!started) {
      setStarted(true);
      track("project_support_click", { project: project?.slug || "general" });
    }
  };
  const newIntent = () => setIdempotencyKey(crypto.randomUUID());

  const onSubmit = async (values) => {
    setStatus("sending");
    setProblem("");
    try {
      if (SITE_KEY && !token) {
        setProblem(formCopy.checking);
        setStatus("error");
        return;
      }
      const value = frequency === "monthly" ? monthlyAmount : Number(onceAmount.replace(",", "."));
      if (!(value >= 10)) {
        setProblem("Choisissez un montant d'au moins 10 €.");
        setStatus("error");
        return;
      }
      track(frequency === "monthly" ? "monthly_donation_selected" : "one_time_donation_selected", { project: project?.slug || "general" });
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, amount: value, frequency, project: project?.slug || undefined, idempotencyKey, turnstileToken: token }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setProblem(json.error || "");
        throw new Error("request failed");
      }
      if (json.url) {
        window.location.assign(json.url);
        return;
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setResetKey((k) => k + 1);
    }
  };

  const inputClass =
    "mt-2 w-full border-b border-ivory/30 bg-transparent py-3 text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-champagne";

  if (!DONATIONS) {
    return <p className="text-ivory-dim">{formCopy.donateNotice}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={onStart} noValidate className="flex flex-col gap-6">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {/* Carte montant — référence envoyée le 2026-10-21 (maquettes d'apps bancaires/crypto) : un contrôle
          segmenté plein largeur pour le type de don, un montant affiché en grand qui réagit au choix, une
          grille de cartes pour les montants fixes. Structure reprise, jamais leurs bleus/violets. Don ponctuel :
          clavier numérique à l'écran façon "Enter your donation" (2e référence du même jour) à la place du
          clavier natif du téléphone — le montant en grand ci-dessous sert d'affichage live. */}
      <div className="rounded-[1.5rem] border border-ivory/15 bg-ink-soft/40 p-5 sm:p-6">
        <div role="radiogroup" aria-label="Type de soutien" className="flex gap-1 rounded-full border border-ivory/15 bg-ink/40 p-1">
          {[
            ["once", s.frequencyOnce],
            ["monthly", s.frequencyMonthly],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={frequency === key}
              onClick={() => {
                onStart();
                setFrequency(key);
                newIntent();
              }}
              className={`min-h-10 flex-1 shrink-0 whitespace-nowrap rounded-full text-[length:var(--text-small)] font-medium transition-colors ${
                frequency === key ? "bg-ivory text-ink" : "text-ivory-dim hover:text-ivory"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{formCopy.amountLabel}</p>
          <p aria-live="polite" className="mt-1 font-sans text-[length:clamp(2.25rem,6vw,2.75rem)] font-normal leading-none text-ivory">
            {frequency === "monthly" ? (
              <>
                {monthlyAmount} €<span className="ml-1 text-[length:var(--text-lead)] font-normal text-ivory-dim">/ mois</span>
              </>
            ) : onceAmount ? (
              `${onceAmount} €`
            ) : (
              <span className="text-ivory-dim/50">— €</span>
            )}
          </p>
        </div>

        {frequency === "once" ? (
          <div className="mt-5">
            <p className="text-[length:var(--text-small)] text-ivory-dim">{s.onceText}</p>
            <div role="group" aria-label={formCopy.customAmount} className="mt-3 grid grid-cols-3 gap-2">
              {KEYPAD_KEYS.map((key, i) =>
                key === "" ? (
                  <span key={`blank-${i}`} aria-hidden="true" />
                ) : (
                  <button
                    key={key}
                    type="button"
                    aria-label={key === "del" ? "Effacer le dernier chiffre" : `Chiffre ${key}`}
                    onClick={() => {
                      onStart();
                      setOnceAmount((prev) => (key === "del" ? prev.slice(0, -1) : (prev + key).replace(/^0+(?=\d)/, "").slice(0, 6)));
                      newIntent();
                    }}
                    className="flex min-h-14 items-center justify-center rounded-2xl border border-ivory/20 text-[length:var(--text-lead)] font-medium text-ivory transition-colors hover:border-ivory/50 active:bg-ivory/10"
                  >
                    {key === "del" ? <BackspaceIcon /> : key}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {s.monthlyAmounts.map((value) => {
              const active = monthlyAmount === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onStart();
                    setMonthlyAmount(value);
                    newIntent();
                  }}
                  className={`min-h-14 shrink-0 rounded-2xl border text-[length:var(--text-small)] font-medium transition-colors ${
                    active ? "border-ivory bg-ivory text-ink" : "border-ivory/20 text-ivory hover:border-ivory/50"
                  }`}
                >
                  {value} €
                </button>
              );
            })}
          </div>
        )}
        {errors.amount ? (
          <p role="alert" className="mt-3 text-sm text-flare">
            {errors.amount.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="invest-email" className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
            Adresse e-mail
          </label>
          <input
            id="invest-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "invest-email-error" : undefined}
            className={inputClass}
            {...register("email")}
          />
          {errors.email ? (
            <p id="invest-email-error" role="alert" className="mt-2 text-sm text-flare">
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="invest-firstName" className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
            Prénom <span className="text-ivory/40">— facultatif</span>
          </label>
          <input id="invest-firstName" type="text" autoComplete="given-name" className={inputClass} {...register("firstName")} />
        </div>
      </div>

      <Turnstile siteKey={SITE_KEY} onToken={setToken} resetKey={resetKey} />

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-[length:var(--text-small)] font-medium text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-white disabled:opacity-60"
        >
          {status === "sending" ? formCopy.sending : s.submit}
        </button>
        {status === "error" ? (
          <p role="alert" className="mt-3 text-flare">
            {problem || formCopy.error}
          </p>
        ) : null}
      </div>
      <p className="max-w-[60ch] text-[length:var(--text-small)] text-ivory-dim/80">{s.mention}</p>
    </form>
  );
}
