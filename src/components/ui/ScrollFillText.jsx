"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import { parseEmphasis } from "@/lib/text";
import { cineReveal } from "@/lib/cine";
import styles from "./scrollFill.module.css";

/** Ponctuation seule : pas d'espace avant (ex. « **histoire**, quelque chose »). */
const PUNCT = /^[.,;:!?…]+$/;

/**
 * Texte dont les mots passent d'estompés à pleins pendant que l'élément traverse l'écran (scrub).
 * Même langage que la section « Énoncé », en version légère (opacité seule : GPU, la couleur reste celle du texte).
 * - `lines` : tableau de lignes ; chaque ligne est un bloc. `**mot**` = mot mis en valeur (voir `emClassName`).
 * - `wordClassName` / `lineWordClassNames` : classe posée sur CHAQUE mot (ex. `text-silver`), globale ou par ligne.
 * - `lineClassNames` : classe optionnelle par ligne.
 * - Sans animation (reduced-motion, sans JS) : texte plein.
 */
export default function ScrollFillText({
  lines,
  as: Tag = "p",
  className = "",
  lineClassNames = [],
  wordClassName = "",
  lineWordClassNames = [],
  emClassName = "",
  dimAlpha = 0.35,
  cine = false,
  cineStagger = 0.06,
  cineBlur = 7,
  ...rest
}) {
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
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const words = [...el.querySelectorAll("[data-fill-word]")];

        // Option `cine` (mobile) : au lieu du remplissage lié au scroll, une apparition de film, ligne par ligne, une seule fois.
        if (cine && mobile) {
          el.querySelectorAll("[data-fill-line]").forEach((line) => {
            cineReveal([...line.querySelectorAll("[data-fill-word]")], { trigger: line, stagger: cineStagger, blur: cineBlur });
          });
          return () => {
            el.dataset.motion = "pending";
          };
        }
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 52%", scrub: 0.4 },
        });
        // Remplissage : chaque mot passe d'estompé à plein, l'un après l'autre. Sur mobile il MONTE aussi d'un cheveu (transform seul,
        // aucun flou : moins coûteux) et l'estompé est plus marqué : on voit le texte « se lire ».
        tl.fromTo(words, { opacity: mobile ? Math.min(dimAlpha, 0.25) : dimAlpha, yPercent: mobile ? 22 : 0 }, { opacity: 1, yPercent: 0, duration: 0.2, stagger: { amount: 0.8 } }, 0);
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
    <Tag ref={root} data-motion="pending" className={`${styles.root} ${className}`} style={{ "--dim-alpha": dimAlpha }} {...rest}>
      {lines.map((line, l) => {
        const tokens = parseEmphasis(line);
        return (
          <span key={l} data-fill-line className={`${styles.line} ${lineClassNames[l] ?? ""}`}>
            {tokens.map((token, i) => (
              <span key={i}>
                <span
                  data-fill-word
                  className={`${styles.word} ${lineWordClassNames[l] ?? wordClassName} ${token.strong ? emClassName : ""}`}
                >
                  {token.text}
                </span>
                {i < tokens.length - 1 && !PUNCT.test(tokens[i + 1].text) ? " " : null}
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
