"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { form as copy } from "@/content/fr";
import { fieldsByMode } from "@/lib/forms/fields";
import { schemasByMode } from "@/lib/forms/schemas";
import { SELECT_MODE_EVENT } from "@/lib/forms/events";
import { track } from "@/lib/analytics";
import Turnstile from "./Turnstile";

// Variables NEXT_PUBLIC_* : inscrites dans le code au moment du build (voir docs/19-backend.md).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/**
 * Formulaire dynamique : une question, puis uniquement les champs du mode choisi.
 * Étape 1 = choix du mode ; étape 2 = champs générés depuis lib/forms/fields.js.
 */
export default function ParticipationForm() {
  const [mode, setMode] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const startedRef = useRef(false);

  // Les CTA de la page présélectionnent le mode.
  useEffect(() => {
    const onSelect = (event) => setMode(event.detail.mode);
    window.addEventListener(SELECT_MODE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_MODE_EVENT, onSelect);
  }, []);

  return (
    <div id="participer" className="mx-auto mt-[var(--space-block)] max-w-4xl scroll-mt-24">
      <h3 data-reveal className="text-center font-sans text-[length:var(--text-title)] font-normal leading-tight tracking-[-0.05em]">{copy.question}</h3>

      <div data-reveal role="radiogroup" aria-label={copy.question} className="mt-8 flex flex-wrap justify-center gap-3">
        {copy.modes.map((item) => {
          const active = mode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setMode(item.mode);
                setStatus("idle");
              }}
              className={`min-h-12 rounded-full border px-6 text-[length:var(--text-small)] font-medium transition-colors ${active ? "border-ivory bg-ivory text-ink" : "border-ivory/25 text-ivory hover:border-ivory/55"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {mode && status !== "success" ? (
        <ModeForm
          key={mode}
          mode={mode}
          status={status}
          setStatus={setStatus}
          onStart={() => {
            if (!startedRef.current) {
              startedRef.current = true;
              track("form_started", { mode });
            }
          }}
        />
      ) : null}

      {status === "success" ? (
        <div role="status" className="mt-12 border border-champagne/40 p-8 text-center">
          <p className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em]">{copy.success.title}</p>
          <p className="mt-2 text-ivory-dim">{copy.success.text}</p>
        </div>
      ) : null}
    </div>
  );
}

function ModeForm({ mode, status, setStatus, onStart }) {
  const fields = fieldsByMode[mode];
  const notices = { donate: copy.donateNotice, member: copy.memberNotice };
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemasByMode[mode]),
    defaultValues: { mode, website: "" },
  });

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
      track("form_submitted", { mode });
      setStatus("success");
    } catch {
      setStatus("error");
      setResetKey((k) => k + 1); // jeton anti-robot à usage unique : on en redemande un
    }
  };

  const inputClass =
    "mt-2 w-full border-b border-ivory/30 bg-transparent py-3 text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-champagne";

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={onStart} noValidate className="form-rise mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
      <input type="hidden" {...register("mode")} />

      {/* Honeypot : invisible pour les humains, hors navigation clavier. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {notices[mode] ? <p className="text-center text-ivory-dim sm:col-span-2">{notices[mode]}</p> : null}

      {fields.map((field) => {
        const error = errors[field.name]?.message;
        const id = `field-${field.name}`;
        return (
          <div key={field.name} className={field.wide || field.type === "textarea" ? "sm:col-span-2" : ""}>
            <label htmlFor={id} className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
              {field.label}
              {field.optional ? <span className="text-ivory/40"> — facultatif</span> : null}
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

      <Turnstile siteKey={SITE_KEY} onToken={setToken} resetKey={resetKey} />

      <div className="flex flex-col items-center sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-[length:var(--text-small)] font-medium text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-white disabled:opacity-60">
          {status === "sending" ? copy.sending : copy.submit}
        </button>
        {status === "error" ? (
          <p role="alert" className="mt-4 text-center text-flare">
            {copy.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
