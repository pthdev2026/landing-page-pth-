"use client";

import { useRef } from "react";
import { support } from "@/content/fr";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import CTAButton from "@/components/ui/CTAButton";
import Accent from "@/components/ui/Accent";
import ScrollFillText from "@/components/ui/ScrollFillText";
import styles from "@/components/support/support.module.css";

/**
 * 11 — SOUTENIR LA VISION + 12 — TROIS MANIÈRES DE PARTICIPER (brief §11-12, textes verbatim dans `support` de fr.js).
 * Le moment de la conversion : « Cette vision se construit maintenant » → les cinq objectifs (texte qui se remplit)
 * → « Vous pouvez prendre part à cette histoire » → trois cartes (Investir / Donner / Devenir bénévole), chacune avec
 * un bouton pilule qui présélectionne le formulaire (via `mode`) et fait défiler jusqu'à lui (il est en fin de page, section Contact).
 */
export default function Support() {
  const root = useRef(null);
  const gridCls = "grid gap-8 lg:grid-cols-[1fr_2.2fr]";

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (isDebugMode()) {
          el.dataset.motion = "off";
          return;
        }
        el.dataset.motion = "on";
        gsap.fromTo(
          "[data-card]",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: { trigger: el.querySelector("[data-cards]"), start: "top 80%", once: true },
          },
        );
        return () => {
          el.dataset.motion = "pending";
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.dataset.motion = "off";
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id={support.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="support-title"
      className={`${styles.section} atmo-red-band px-[var(--space-gutter)] py-[var(--space-section)]`}
    >
      <div className="mx-auto max-w-[110rem]">
        {/* 11 — Soutenir la vision */}
        <h2
          id="support-title"
          data-reveal
          className="max-w-[18ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
        >
          <Accent text={support.title} />
        </h2>

        <div className={`${gridCls} mt-[var(--space-block)]`}>
          <div aria-hidden="true" className="hidden lg:block" />
          <ScrollFillText
            cine
            lines={support.goals}
            wordClassName="text-silver"
            className="max-w-[30ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.3] tracking-[-0.05em] text-ivory"
          />
        </div>

        <ScrollFillText
          cine
          lines={[support.conclusion]}
          wordClassName="text-silver"
          emClassName="text-accent"
          className="mt-[var(--space-block)] max-w-[26ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-ivory"
        />

        {/* 12 — Trois manières de participer */}
        <ul data-cards className="mt-[var(--space-section)] grid gap-4 lg:grid-cols-3 lg:gap-5">
          {support.entries.map((entry) => (
            <li key={entry.mode} data-card className={styles.card}>
              <div>
                <p className={styles.kicker}>{entry.kicker}</p>
                <h3 className={`${styles.title} text-silver`}>{entry.title}</h3>
                <p className={styles.text}>{entry.text}</p>
              </div>
              {/* Le don a son propre bloc (pas le sélecteur générique) : on y mène directement, sans présélection de mode. */}
              <CTAButton href={entry.mode === "donate" ? "#don" : "#participer"} mode={entry.mode === "donate" ? undefined : entry.mode} variant="solid" arrow className="self-start">
                {entry.cta}
              </CTAButton>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
