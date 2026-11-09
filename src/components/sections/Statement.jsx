"use client";

import { useRef } from "react";
import { statement } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { parseEmphasis } from "@/lib/text";
import { DIM_ALPHA, SECTION_HEIGHT } from "@/components/statement/statementConfig";
import styles from "@/components/statement/statement.module.css";

/**
 * 02 — ÉNONCÉ. « Nous racontons des histoires pour rendre visible ce que Dieu fait encore. »
 * Idée : après l'intro, une seule phrase, immense, qui se remplit mot à mot pendant qu'on défile.
 *
 * Fonctionnement :
 *  1. La section est plus haute que l'écran ; son contenu (.sticky) reste collé à l'écran (CSS `position: sticky`).
 *  2. Une timeline GSAP relie la progression du scroll dans la section au remplissage : chaque mot passe de
 *     « argent estompé » à l'argent plein, de gauche à droite (scrub).
 *  3. Parallaxe (desktop seulement) : le bloc de texte et la lueur bougent légèrement en sens opposé.
 *  4. « Réduire les animations » : aucun mouvement, la phrase est directement dans sa couleur finale.
 *
 * Debug : `?debug` désactive le scroll et expose la timeline sur window.__pthStatement (dev uniquement).
 */
export default function Statement() {
  const root = useRef(null);
  const words = parseEmphasis(statement.text);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();
      const debug = process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("debug");

      // Remplissage (toutes tailles) : cascade de mots pendant que la section défile.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.dataset.motion = "on";
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: debug });
        // Progression 0 → 1 = tout le scroll de la section. Les mots se remplissent entre 0,06 et ~0,9 ;
        // la fin (0,9 → 1) est un palier : phrase complète, le temps de la lire.
        tl.fromTo(
          "[data-fillword]",
          { opacity: mobile ? Math.min(DIM_ALPHA, 0.22) : DIM_ALPHA, yPercent: mobile ? 26 : 0 },
          { opacity: 1, yPercent: 0, duration: 0.12, stagger: { amount: 0.72 } },
          0.06,
        );
        tl.fromTo("[data-glow]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.15);
        tl.set({}, {}, 1);

        if (debug) window.__pthStatement = tl;
        else {
          ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", scrub: 0.5, animation: tl });
        }
        return () => {
          el.dataset.motion = "pending";
        };
      });

      // Parallaxe : sur bureau (±10 %) ET sur mobile, à amplitude réduite (±5 %) — même animation, adaptée au pouce.
      const parallax = (block, glow) => () => {
        if (debug) return;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
        tl.fromTo("[data-block]", { yPercent: block }, { yPercent: -block }, 0);
        tl.fromTo("[data-glow]", { yPercent: -glow }, { yPercent: glow }, 0);
      };
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", parallax(10, 18));
      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", parallax(5, 10));

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.dataset.motion = "off";
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id={statement.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="statement-title"
      className={`${styles.section} grain`}
      style={{
        "--section-height": SECTION_HEIGHT.desktop,
        "--section-height-mobile": SECTION_HEIGHT.mobile,
        "--dim-alpha": DIM_ALPHA,
      }}
    >
      <div className={styles.sticky}>
        <div data-glow className={styles.glow} aria-hidden="true" />
        <div data-block className={styles.block}>
          <h2 id="statement-title" className={styles.text}>
            {words.map((word, i) => {
              const pill = statement.pills?.find((p) => p.after === word.text);
              return (
                <span key={i}>
                  <span data-fillword className={`${styles.word} ${word.strong ? "text-accent" : ""}`}>
                    {word.text}
                  </span>
                  {pill ? (
                    <>
                      {" "}
                      <span data-fillword aria-hidden="true" className={styles.pill} style={{ backgroundImage: `url(${pill.src})` }} />
                    </>
                  ) : null}
                  {i < words.length - 1 ? " " : null}
                </span>
              );
            })}
          </h2>
        </div>
      </div>
    </section>
  );
}
