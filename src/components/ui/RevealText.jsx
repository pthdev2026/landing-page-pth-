"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenMotionOK, motion } from "@/lib/animations";
import { parseEmphasis } from "@/lib/text";
import { cineReveal } from "@/lib/cine";

/** Ponctuation seule : pas d'espace avant. */
const PUNCT = /^[.,;:!?…]+$/;

/**
 * Révèle un texte mot par mot (masque + montée) au scroll.
 * - Le texte est toujours présent dans le DOM et lisible sans JS / avec reduced-motion.
 * - `children` doit être une chaîne.
 */
export default function RevealText({ as: Tag = "p", children, className = "", wordClassName = "", emClassName = "", stagger = 0.045, start = "top 85%", cine = false }) {
  const ref = useRef(null);
  const words = parseEmphasis(String(children));

  useGSAP(
    () => {
      const mm = whenMotionOK(ref, () => {
        const targets = ref.current.querySelectorAll("[data-word]");
        // Option `cine` (mobile) : apparition de film (mise au point mot après mot) au lieu de la montée sous masque.
        if (cine && window.matchMedia("(max-width: 767px)").matches) {
          cineReveal([...targets], { trigger: ref.current, stagger: 0.035 });
          return;
        }
        gsap.set(targets, { yPercent: 110 });
        gsap.to(targets, {
          yPercent: 0,
          duration: motion.duration.slow,
          ease: motion.ease.cine,
          stagger,
          scrollTrigger: { trigger: ref.current, start, once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom max-md:overflow-visible">
          <span data-word className={`inline-block will-change-transform ${wordClassName} ${word.strong ? emClassName : ""}`}>
            {word.text}
          </span>
          {i < words.length - 1 && !PUNCT.test(words[i + 1].text) ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
