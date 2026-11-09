"use client";

import { gsap } from "@/lib/gsap";

/** Easings/durées GSAP alignés sur les tokens CSS (voir tokens.css). */
export const motion = {
  ease: { cine: "expo.out", slow: "power2.inOut", soft: "power3.out" },
  duration: { fast: 0.2, base: 0.6, slow: 1.2, cine: 1.8 },
};

/**
 * Exécute `setup` uniquement si l'utilisateur n'a PAS demandé de réduire les animations.
 * Retourne le matchMedia : à `revert()` dans le cleanup de useGSAP.
 * Le contenu reste toujours visible sans animation (règle d'accessibilité du brief).
 */
export function whenMotionOK(scope, setup) {
  const mm = gsap.matchMedia(scope);
  mm.add("(prefers-reduced-motion: no-preference)", setup);
  return mm;
}

/** Variante desktop uniquement (parallax, sticky, effets lourds). */
export function whenDesktopMotionOK(scope, setup) {
  const mm = gsap.matchMedia(scope);
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", setup);
  return mm;
}
