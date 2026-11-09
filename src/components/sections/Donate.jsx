"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donate as copy, form as formCopy } from "@/content/fr";
import { fieldsByMode } from "@/lib/forms/fields";
import { donationCheckoutSchema, donateSchema } from "@/lib/forms/schemas";
import { track } from "@/lib/analytics";
import Accent from "@/components/ui/Accent";
import Turnstile from "@/components/form/Turnstile";
import styles from "@/components/donate/donate.module.css";

// Variables NEXT_PUBLIC_* : inscrites dans le code au moment du build (voir docs/19-backend.md).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const DONATIONS = process.env.NEXT_PUBLIC_DONATIONS_ENABLED === "true";

/**
 * 11bis — FAIRE UN DON. Bloc dédié, séparé du sélecteur générique « Comment souhaitez-vous participer ? »
 * (demande utilisateur du 2026-10-13 : « il faut un bloc spécial dédié à ça »). Juste après Support (§11-12),
 * avant Membre. Volontairement encadré (coins arrondis, ombre portée) plutôt que plein cadre comme les autres
 * sections — un module qui se détache visuellement du fil narratif. Trois zones dans un seul cadre (référence
 * du 2026-10-14 : photo + panneau latéral + bande d'action pleine largeur, adapté à notre rouge/noir/argent —
 * jamais le bleu/violet des références, voir `donate.module.css`). Dans le panneau des champs : le rythme du don
 * (Ponctuel/Récurrent, par défaut sur Récurrent) juste au-dessus du montant (demande du 2026-10-15). Deux
 * comportements selon `NEXT_PUBLIC_DONATIONS_ENABLED` :
 * - activé : montant + rythme → redirection Stripe Checkout (paiement réel, voir api/donate).
 * - désactivé : simple prise de coordonnées (email), on recontacte le donateur (voir api/participate).
 */
export default function Donate() {
  return (
    <section id={copy.id} aria-labelledby="donate-title" className="px-[var(--space-gutter)] py-[var(--space-section)]">
      <div className="mx-auto max-w-[72rem]">{DONATIONS ? <OnlineDonateForm /> : <OfflineDonateForm />}</div>
    </section>
  );
}

/** Photo + argumentaire — partagé par les deux formulaires. Le rythme du don (Ponctuel/Récurrent) n'y vit plus
 * depuis le 2026-10-15 (demande utilisateur : « doit être au-dessus de montant ») — il vit maintenant dans le
 * panneau des champs, juste au-dessus de « Montant du don ». */
function Pitch() {
  return (
    <div className={styles.pitch}>
      {copy.media?.src ? (
        <Image src={copy.media.src} alt={copy.media.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className={styles.photo} />
      ) : null}
      <div aria-hidden="true" className={styles.scrim} />
      <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{copy.kicker}</p>
      <h2
        id="donate-title"
        className="max-w-[14ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
      >
        <Accent text={copy.title} />
      </h2>
      <p className="max-w-[30ch] text-[length:var(--text-lead)] leading-[1.25] text-ivory-dim">{copy.intro}</p>
      <ul className={styles.points}>
        {copy.points.map((point) => (
          <li key={point} className={styles.point}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Montant libre des deux côtés (ponctuel ET mensuel, demande utilisateur du 2026-10-14) : ces boutons ne sont que
// des suggestions, jamais une contrainte — le champ « Autre montant » reste toujours disponible, quel que soit le rythme.
// Refonte du 2026-11-02 (référence : montants d'abord, puis fréquence, « Autre » pour le champ libre) : 20/50/100/150.
const AMOUNTS = [20, 50, 100, 150];
const DEFAULT_AMOUNT = 50;

function OnlineDonateForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [custom, setCustom] = useState("");
  const [otherOpen, setOtherOpen] = useState(false);
  // Récurrent par défaut (demande utilisateur du 2026-10-15 : « nativement sur récurrent ») — un don mensuel
  // pèse plus dans la durée qu'un don ponctuel, la case de départ encourage ce choix sans l'imposer.
  const [frequency, setFrequency] = useState("monthly");
  const [problem, setProblem] = useState("");
  const [started, setStarted] = useState(false);
  // Clé d'idempotence Stripe : un UUID par tentative de paiement, renouvelé seulement si le donateur change de
  // montant ou de rythme — une vraie nouvelle intention de don (brief Stripe du 2026-10-13, §11).
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(donationCheckoutSchema),
    // `message` : requis par le schéma (une chaîne, vide ou non — jamais `undefined`) mais ce formulaire minimal
    // n'affiche pas de champ message ; sans cette valeur par défaut, le résolveur le rejette silencieusement
    // (même famille de bug que `amount` ci-dessus — aucune erreur visible, le bouton semblait juste inerte).
    defaultValues: { website: "", amount: DEFAULT_AMOUNT, message: "" },
  });

  // Le montant vit en état local (boutons + saisie libre), jamais inscrit via `register` : sans ce sync, la valeur
  // que le résolveur Zod valide reste `undefined` et bloque silencieusement l'envoi (aucune erreur visible nulle
  // part, le bouton semble juste ne rien faire — bug corrigé le 2026-10-14, signalé par l'utilisateur).
  useEffect(() => {
    const value = otherOpen ? Number(custom.replace(",", ".")) : amount;
    setValue("amount", Number.isFinite(value) ? value : undefined, { shouldValidate: false });
  }, [amount, custom, otherOpen, setValue]);

  const onStart = () => {
    if (!started) {
      setStarted(true);
      track("form_started", { mode: "donate" });
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
      // Montant libre des deux côtés : même plancher de 10 €, qu'il s'agisse d'un don ponctuel ou mensuel.
      const value = otherOpen ? Number(custom.replace(",", ".")) : amount;
      if (!(value >= 10)) {
        setProblem("Choisissez un montant d'au moins 10 €.");
        setStatus("error");
        return;
      }
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, amount: value, frequency, idempotencyKey, turnstileToken: token }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setProblem(json.error || "");
        throw new Error("request failed");
      }
      track("form_submitted", { mode: "donate" });
      if (json.url) {
        window.location.assign(json.url); // on reste en « envoi… » pendant la redirection
        return;
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setResetKey((k) => k + 1); // jeton anti-robot à usage unique : on en redemande un
    }
  };

  // Panneau clair (référence envoyée le 2026-10-19 : son panneau de droite est clair — structure reprise,
  // jamais ses couleurs). Texte foncé, accent bordeaux (`--color-crimson`), même recette que les autres blocs
  // ivoire du site (Promesse, /projets) — voir `donate.module.css` pour la partie non réutilisable en Tailwind.
  const inputClass =
    "mt-2 w-full border-b border-ink/20 bg-transparent py-3 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-crimson";

  return (
    <form data-reveal onSubmit={handleSubmit(onSubmit)} onChange={onStart} noValidate className={`form-rise ${styles.module}`}>
      {/* Honeypot : invisible pour les humains, hors navigation clavier. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <Pitch />

      <div data-light-section className={styles.fields}>
        {/* Montant d'abord, puis fréquence (refonte du 2026-11-02) : « Autre » ouvre le champ libre. */}
        <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-crimson">{formCopy.amountLabel}</p>
        <div role="group" aria-label={formCopy.amountLabel} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {AMOUNTS.map((value) => {
            const active = !otherOpen && amount === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onStart();
                  setAmount(value);
                  setOtherOpen(false);
                  newIntent();
                }}
                className={`min-h-12 whitespace-nowrap rounded-2xl border text-[length:var(--text-small)] font-medium transition-colors ${
                  active ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink hover:border-ink/45"
                }`}
              >
                {value} €
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={otherOpen}
            onClick={() => {
              onStart();
              setOtherOpen(true);
              newIntent();
            }}
            className={`min-h-12 whitespace-nowrap rounded-2xl border text-[length:var(--text-small)] font-medium transition-colors ${
              otherOpen ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink hover:border-ink/45"
            }`}
          >
            Autre
          </button>
        </div>
        {otherOpen ? (
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            aria-label={formCopy.customAmount}
            placeholder={formCopy.customAmount}
            value={custom}
            onChange={(e) => {
              onStart();
              setCustom(e.target.value.replace(/[^\d.,]/g, ""));
              newIntent();
            }}
            className="mt-3 min-h-12 w-full rounded-2xl border border-ink/20 bg-transparent px-5 text-[length:var(--text-small)] text-ink outline-none placeholder:text-ink/40 focus:border-crimson sm:w-60"
          />
        ) : null}

        <p className="mt-8 font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-crimson">Fréquence</p>
        <div role="radiogroup" aria-label="Fréquence du don" className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["monthly", formCopy.frequencyMonthly],
            ["once", formCopy.frequencyOnce],
          ].map(([key, label]) => {
            const checked = frequency === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => {
                  onStart();
                  setFrequency(key);
                  newIntent();
                }}
                className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-left text-[length:var(--text-small)] transition-colors ${
                  checked ? "border-ink text-ink" : "border-ink/20 text-ink/65 hover:border-ink/45"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${checked ? "border-crimson" : "border-ink/35"}`}
                >
                  {checked ? <span className="size-2.5 rounded-full bg-crimson" /> : null}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {errors.amount ? (
          <p role="alert" className="mt-3 text-sm text-flare">
            {errors.amount.message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="donate-email" className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-crimson">
              Email
            </label>
            <input
              id="donate-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "donate-email-error" : undefined}
              className={inputClass}
              {...register("email")}
            />
            {errors.email ? (
              <p id="donate-email-error" role="alert" className="mt-2 text-sm text-flare">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="donate-firstName" className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-crimson">
              Prénom <span className="text-ink/40">— facultatif</span>
            </label>
            <input id="donate-firstName" type="text" autoComplete="given-name" className={inputClass} {...register("firstName")} />
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <Turnstile siteKey={SITE_KEY} onToken={setToken} resetKey={resetKey} />
        </div>
      </div>

      <div data-light-section className={styles.bottomBar}>
        <p className="flex items-center gap-2 text-[length:var(--text-small)] text-ink/65">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4 shrink-0 text-crimson">
            <path d="M10 1.5 3.5 4.2v4.6c0 4.3 2.8 7.9 6.5 9.2 3.7-1.3 6.5-4.9 6.5-9.2V4.2L10 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="m7.3 10.1 1.9 1.9 3.6-3.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Paiement sécurisé par Stripe — vos données bancaires ne passent jamais par ce site.
        </p>
        <div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-[length:var(--text-small)] font-medium text-ivory shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {status === "sending" ? formCopy.sending : formCopy.donateSubmit}
          </button>
          {status === "error" ? (
            <p role="alert" className="mt-3 text-flare">
              {problem || formCopy.error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function OfflineDonateForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [started, setStarted] = useState(false);
  const fields = fieldsByMode.donate;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(donateSchema), defaultValues: { mode: "donate", website: "" } });

  const onStart = () => {
    if (!started) {
      setStarted(true);
      track("form_started", { mode: "donate" });
    }
  };

  const onSubmit = async (values) => {
    setStatus("sending");
    try {
      if (SITE_KEY && !token) {
        setStatus("error");
        return;
      }
      const response = await fetch("/api/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: token }),
      });
      if (!response.ok) throw new Error("request failed");
      track("form_submitted", { mode: "donate" });
      setStatus("success");
    } catch {
      setStatus("error");
      setResetKey((k) => k + 1); // jeton anti-robot à usage unique : on en redemande un
    }
  };

  const inputClass =
    "mt-2 w-full border-b border-ink/20 bg-transparent py-3 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-crimson";

  if (status === "success") {
    return (
      <div role="status" data-reveal className="border border-champagne/40 p-8 text-center">
        <p className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em]">{formCopy.success.title}</p>
        <p className="mt-2 text-ivory-dim">{formCopy.success.text}</p>
      </div>
    );
  }

  return (
    <form data-reveal onSubmit={handleSubmit(onSubmit)} onChange={onStart} noValidate className={`form-rise ${styles.module}`}>
      <input type="hidden" {...register("mode")} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <Pitch />

      <div data-light-section className={`${styles.fields} grid gap-x-6 gap-y-6 sm:grid-cols-2`}>
        <p className="text-ink/65 sm:col-span-2">{formCopy.donateNotice}</p>

        {fields.map((field) => {
          const error = errors[field.name]?.message;
          const id = `donate-offline-${field.name}`;
          return (
            <div key={field.name} className={field.wide || field.type === "textarea" ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-crimson">
                {field.label}
                {field.optional ? <span className="text-ink/40"> — facultatif</span> : null}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  rows={4}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={inputClass}
                  {...register(field.name)}
                />
              ) : (
                <input
                  id={id}
                  type={field.type ?? "text"}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={inputClass}
                  {...register(field.name)}
                />
              )}
              {error ? (
                <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-flare">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="sm:col-span-2">
          <Turnstile siteKey={SITE_KEY} onToken={setToken} resetKey={resetKey} />
        </div>
      </div>

      <div data-light-section className={`${styles.bottomBar} justify-end`}>
        <div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-[length:var(--text-small)] font-medium text-ivory shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {status === "sending" ? formCopy.sending : formCopy.submit}
          </button>
          {status === "error" ? (
            <p role="alert" className="mt-3 text-flare">
              {formCopy.error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
