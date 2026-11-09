"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";

/**
 * Entrées « cinéma » des blocs qui n'ont pas de scène dédiée (titres, cartes, formulaire, pied de page).
 * UN seul endroit, identique sur mobile et sur bureau : tout élément portant `data-reveal` monte, se met au point
 * (flou → net) et apparaît quand il entre dans l'écran, une seule fois.
 *   data-reveal            → titre / bloc : montée + mise au point (bureau). Mobile, SANS flou (un flou animé sur de grandes
 *                            zones fait ramer les téléphones) : les TITRES se dévoilent en « rideau » (découpe qui s'ouvre de
 *                            haut en bas pendant la montée), les autres blocs montent en apparaissant.
 *   data-reveal="fade"     → simple apparition (éléments déjà animés dedans, ex. boutons)
 *   data-reveal-delay="0.1" → retard en secondes (échelonne plusieurs éléments qui entrent ensemble)
 * Le DOM par défaut est l'état FINAL (sans JS, reduced-motion, ?debug : tout est visible et lisible).
 * Les éléments déjà dans l'écran au chargement (ou passés) se révèlent aussitôt, sans attendre.
 */
export default function PageMotion() {
  useGSAP(() => {
    if (isDebugMode()) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const els = gsap.utils.toArray("[data-reveal]");
      els.forEach((el) => {
        const fade = el.dataset.reveal === "fade";
        const delay = Number(el.dataset.revealDelay) || 0;
        const heading = /^H[1-6]$/.test(el.tagName);
        const from = fade
          ? { opacity: 0 }
          : mobile
            ? heading
              ? { opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" }
              : { opacity: 0, y: 46 }
            : { opacity: 0, y: 34, filter: "blur(8px)" };
        const to = fade
          ? { opacity: 1 }
          : mobile
            ? heading
              ? { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }
              : { opacity: 1, y: 0 }
            : { opacity: 1, y: 0, filter: "blur(0px)" };
        gsap.fromTo(el, from, {
          ...to,
          delay,
          duration: fade ? 0.9 : mobile ? (heading ? 1.25 : 1.05) : 1.15,
          ease: mobile ? "power3.out" : "expo.out",
          clearProps: "filter,transform,clipPath", // rend l'élément à l'état du DOM une fois révélé (pas de calque GPU qui traîne)
          scrollTrigger: { trigger: el, start: mobile ? "top 93%" : "top 90%", once: true },
        });
      });

      if (mobile) {
        // Cadres photo « développés » : le cadre s'ouvre en rideau (haut → bas) pendant que l'image se recale (zoom qui se pose),
        // puis elle dérive doucement à contre-sens du scroll (parallaxe) : la photo vit derrière la vitre. Transform / clip-path seulement.
        gsap.utils.toArray("[data-media]").forEach((frame) => {
          const img = frame.querySelector("img, video");
          gsap.fromTo(
            frame,
            { opacity: 0, clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "power3.inOut", clearProps: "clipPath,opacity", scrollTrigger: { trigger: frame, start: "top 90%", once: true } },
          );
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.22, yPercent: 6 },
              { scale: 1.04, yPercent: -6, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 } },
            );
          }
        });

        // Liste « générique de film » : l'élément au centre de l'écran s'allume, ceux à venir sont éteints, ceux déjà passés restent à demi.
        const focusItems = gsap.utils.toArray("[data-focus]");
        const setFocus = (el, alpha) => gsap.to(el, { opacity: alpha, duration: 0.6, ease: "power2.out", overwrite: true });
        focusItems.forEach((el) => {
          gsap.set(el, { opacity: 0.22 });
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 52%",
            onEnter: () => setFocus(el, 1),
            onLeave: () => setFocus(el, 0.55),
            onEnterBack: () => setFocus(el, 1),
            onLeaveBack: () => setFocus(el, 0.22),
          });
        });
      }
      return () => ScrollTrigger.refresh();
    });
    return () => mm.revert();
  });
  return null;
}
