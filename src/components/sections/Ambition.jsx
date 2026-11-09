"use client";

import { useRef } from "react";
import { ambition } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import { parseEmphasis } from "@/lib/text";
import Subtitle from "@/components/ui/Subtitle";
import styles from "@/components/ambition/ambition.module.css";

const SECTION_HEIGHT = { desktop: 290, mobile: 255 }; // % de la hauteur d'écran : la différence avec 100 = longueur du scroll
const DOTS = 44;
const PUNCT = /^[.,;:!?…]+$/;

/** Générateur pseudo-aléatoire déterministe : mêmes positions côté serveur et client (pas de décalage d'hydratation). */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = seeded(20260925);
const dots = Array.from({ length: DOTS }, () => ({
  left: 4 + rand() * 92, // % du conteneur
  top: 6 + rand() * 88,
  size: 2 + Math.round(rand() * 2), // px
  alpha: 0.35 + rand() * 0.45,
}));

/** Mots d'une phrase, avec `**emphase**` rendue en voix serif italique. */
function Words({ text }) {
  const tokens = parseEmphasis(text);
  return tokens.map((t, i) => (
    <span key={i}>
      <span data-w className={`${styles.word} ${t.strong ? styles.em : ""}`}>
        {t.text}
      </span>
      {/* Pas d'espace avant une ponctuation (le point final après l'italique). */}
      {i < tokens.length - 1 && !PUNCT.test(tokens[i + 1].text) ? " " : null}
    </span>
  ));
}

/**
 * 05 — NOTRE AMBITION. Transition : de ce que PTH est à ce que PTH veut devenir.
 * La question s'écrit en sous-titre (comme la Hero) ; les histoires (points de lumière) convergent vers le centre
 * et se fondent en une lueur ; de cette lueur naît la réponse.
 */
export default function Ambition() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const debug = isDebugMode();
        el.dataset.motion = "on";
        const sticky = el.querySelector("[data-sticky]");

        // Distance de chaque point jusqu'au centre du conteneur (recalculée à chaque refresh : resize, rotation…).
        const toCenterX = (_, dot) => sticky.clientWidth / 2 - (dot.offsetLeft + dot.offsetWidth / 2);
        const toCenterY = (_, dot) => sticky.clientHeight / 2 - (dot.offsetTop + dot.offsetHeight / 2);

        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: debug });
        const wordFrom = { opacity: 0, y: 6, filter: "blur(6px)" };
        const wordIn = { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" };

        // Les histoires apparaissent, éparpillées dans le noir.
        tl.fromTo("[data-dot]", { opacity: 0 }, { opacity: (i, t) => t.dataset.alpha, duration: 0.8, stagger: { amount: 0.8 } }, 0);

        // La question, mot par mot.
        tl.fromTo("[data-question] [data-w]", wordFrom, { ...wordIn, stagger: 0.28 }, 0.5);

        // Palier de lecture (≈ 3.4 → 5.0) — puis les histoires convergent, la question s'estompe derrière la réponse.
        tl.to("[data-dot]", { x: toCenterX, y: toCenterY, duration: 5, ease: "power2.inOut" }, 2.6);
        tl.to("[data-question]", { opacity: 0.5, duration: 0.9 }, 5.2);
        tl.fromTo("[data-glow]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2.4 }, 5.2);
        // Arrivées au centre, elles se fondent dans la lueur.
        tl.to("[data-dot]", { opacity: 0, scale: 0, duration: 0.7, stagger: { amount: 0.5 } }, 7.3);

        // La réponse naît de la lueur.
        tl.fromTo("[data-lead] [data-w]", wordFrom, { ...wordIn, stagger: 0.1 }, 6.7);
        tl.fromTo("[data-statement] [data-w]", wordFrom, { ...wordIn, stagger: 0.16 }, 7.5);
        tl.set({}, {}, 10);

        if (debug) window.__pthAmbition = tl;
        else {
          ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            animation: tl,
            invalidateOnRefresh: true,
          });
        }
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
      id={ambition.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="ambition-title"
      className={`${styles.section} grain`}
      style={{ "--section-height": SECTION_HEIGHT.desktop, "--section-height-mobile": SECTION_HEIGHT.mobile }}
    >
      <div data-sticky className={styles.sticky}>
        {dots.map((d, i) => (
          <span
            key={i}
            data-dot
            data-alpha={d.alpha.toFixed(2)}
            aria-hidden="true"
            className={styles.dot}
            style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, opacity: d.alpha }}
          />
        ))}
        <div data-glow className={styles.glow} aria-hidden="true" />

        <div className={styles.column}>
          <Subtitle data-question text={ambition.question} className={styles.question} />
          <p data-lead className={styles.lead}>
            <Words text={ambition.lead} />
          </p>
          <h2 id="ambition-title" data-statement className={styles.statement}>
            <Words text={ambition.statement} />
          </h2>
        </div>
      </div>
    </section>
  );
}
