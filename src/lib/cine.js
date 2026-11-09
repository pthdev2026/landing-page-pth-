"use client";

import { gsap } from "@/lib/gsap";

/**
 * Apparition « de film » d'un bloc de texte : les mots surgissent l'un après l'autre, chacun avec une MISE AU POINT
 * (flou → net) et une légère montée — le même langage que les sous-titres de l'intro de la Hero.
 * Déclenchée UNE fois quand le bloc entre dans l'écran (pas liée au scroll : le rythme est celui du film, pas du pouce).
 *
 * @param {HTMLElement[]} words   les mots (éléments inline-block) dans l'ordre de lecture
 * @param {object} opts          trigger = élément qui déclenche ; blur (px), y (px), duration (s), stagger (s), start
 */
export function cineReveal(words, { trigger, blur = 7, y = 20, duration = 1.05, stagger = 0.06, start = "top 88%" } = {}) {
  if (!words.length) return;
  const scrollTrigger = { trigger, start, once: true };
  gsap.fromTo(
    words,
    { opacity: 0, y, filter: `blur(${blur}px)` },
    { opacity: 1, y: 0, filter: "blur(0px)", duration, ease: "power3.out", stagger, clearProps: "filter,transform", scrollTrigger },
  );
}
