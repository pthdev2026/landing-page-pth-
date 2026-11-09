"use client";

import { useRef } from "react";
import { promise } from "@/content/fr";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import ScrollFillText from "@/components/ui/ScrollFillText";
import styles from "@/components/promesse/promesse.module.css";

/**
 * 07 — NOTRE PROMESSE. L'idée fondamentale d'Origin : se divertir sans mettre sa foi entre parenthèses.
 * Rôle : le contraste clair du site (bande ivoire). Une seule couleur d'accent, le bordeaux.
 *
 * Trois temps : la phrase-promesse (texte qui se remplit, encre sur ivoire) → l'expérience (la phrase du brief
 * décomposée en quatre lignes à filets, style éditorial) → la phrase forte, en clôture.
 */
export default function Promesse() {
  const root = useRef(null);

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
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: el.querySelector("[data-list]"), start: "top 80%", once: true },
        });
        tl.fromTo("[data-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1.4, stagger: 0.14 }, 0)
          .fromTo("[data-row]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 0.2);
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
      id={promise.id}
      ref={root}
      data-motion="pending"
      data-light-section
      aria-labelledby="promesse-title"
      className={`${styles.section} px-[var(--space-gutter)] py-[var(--space-section)]`}
    >
      <div className="mx-auto max-w-[110rem]">
        <ScrollFillText
          cine
          as="h2"
          id="promesse-title"
          lines={[promise.statement]}
          wordClassName="text-metal"
          emClassName="text-accent"
          className="max-w-[22ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-ink"
        />

        <div className="mt-[var(--space-block)] grid gap-8 lg:grid-cols-[1fr_2.2fr]">
          <p className={styles.kicker}>{promise.kicker}</p>
          <div>
            <p className="max-w-[40ch] text-[length:var(--text-lead)] leading-snug text-ink/70">{promise.intro}</p>

            <div data-list className="mt-[var(--space-sub)]">
              <p className={`${styles.kicker} mb-4`}>{promise.attributesKicker}</p>
              <div data-rule className={styles.rule} aria-hidden="true" />
              <ul>
                {promise.attributes.map((item) => (
                  <li key={item.word}>
                    <div data-row className={styles.row}>
                      <span className={`${styles.word} ${item.accent ? styles.accent : ""}`}>{item.word}</span>
                      <span className={styles.note}>{item.note}</span>
                    </div>
                    <div data-rule className={styles.rule} aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ScrollFillText
          cine
          lines={promise.closing}
          wordClassName="text-metal"
          emClassName="text-accent"
          className="mt-[var(--space-section)] text-center font-sans text-[clamp(2rem,0.8rem+4vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.05em] text-ink"
        />
      </div>
    </section>
  );
}
