"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectsPage as copy } from "@/content/fr";
import { newsletterSchema } from "@/lib/forms/schemas";
import { track } from "@/lib/analytics";
import Turnstile from "@/components/form/Turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/**
 * Bloc « Suivre » (brief §9, option 2) — réutilise le système de formulaires existant (`/api/participate`,
 * `schemasByMode`/`fieldsByMode`, stockage `leads`) via un mode dédié `newsletter`, plutôt qu'une route ou une
 * table à part. Consentement explicite, JAMAIS coché par défaut (RGPD).
 */
export default function NewsletterForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const c = copy.support.follow;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newsletterSchema), defaultValues: { mode: "newsletter", consent: false, website: "" } });

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
      track("newsletter_submit", {});
      setStatus("success");
    } catch {
      setStatus("error");
      setResetKey((k) => k + 1);
    }
  };

  if (status === "success") {
    return (
      <p role="status" className="text-ivory">
        {c.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <input type="hidden" {...register("mode")} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div>
        <label htmlFor="newsletter-email" className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
          {c.emailLabel}
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          className="mt-2 w-full border-b border-ivory/30 bg-transparent py-3 text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-champagne"
          {...register("email")}
        />
        {errors.email ? (
          <p id="newsletter-email-error" role="alert" className="mt-2 text-sm text-flare">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-[length:var(--text-small)] text-ivory-dim">
        <input type="checkbox" className="mt-1 size-4 shrink-0 accent-champagne" {...register("consent")} />
        <span>
          {c.consentLabel}{" "}
          <a href="/confidentialite" className="underline hover:text-ivory">
            Politique de confidentialité
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p role="alert" className="text-sm text-flare">
          {errors.consent.message}
        </p>
      ) : null}

      <Turnstile siteKey={SITE_KEY} onToken={setToken} resetKey={resetKey} />

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-[length:var(--text-small)] font-medium text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-white disabled:opacity-60"
        >
          {status === "sending" ? "Envoi…" : c.submit}
        </button>
        {status === "error" ? (
          <p role="alert" className="mt-3 text-flare">
            {c.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
