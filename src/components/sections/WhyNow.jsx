"use client";

import { useRef } from "react";
import Image from "next/image";
import { why } from "@/content/fr";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import Accent from "@/components/ui/Accent";
import ScrollFillText from "@/components/ui/ScrollFillText";
import styles from "@/components/whynow/whynow.module.css";

/**
 * 10 — POURQUOI MAINTENANT. Section courte mais stratégique : les usages ont changé, le message non.
 * La génération regarde autrement (quatre cartes-affiches) → « Le message ne change pas. La manière de le transmettre, oui. »
 * Tous les textes viennent de fr.js (`why`), tels que dans le brief.
 */
export default function WhyNow() {
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
        gsap.fromTo(
          "[data-card]",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
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
      id={why.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="why-title"
      className={`${styles.section} atmo-glow-bottom px-[var(--space-gutter)] py-[var(--space-section)]`}
    >
      <div className="mx-auto max-w-[110rem]">
        <h2
          id="why-title"
          data-reveal
          className="max-w-[20ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
        >
          <Accent text={why.statement} />
        </h2>

        <ul data-cards className={`${styles.grid} mt-[var(--space-block)]`}>
          {why.cards.map((card, i) => (
            <li key={card.text} data-card className={styles.card}>
              <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className={styles.photo} />
              <div aria-hidden="true" className={styles.scrim} />
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={`${styles.line} text-silver`}>
                <Accent text={card.text} />
              </p>
            </li>
          ))}
        </ul>

        <ScrollFillText
          cine
          lines={why.closing}
          wordClassName="text-silver"
          emClassName="text-accent"
          className="mt-[var(--space-section)] text-center font-sans text-[length:var(--text-headline)] font-normal leading-[1.12] tracking-[-0.05em] text-ivory"
        />
      </div>
    </section>
  );
}
