"use client";

/**
 * Point d'entrée unique de GSAP. Les composants importent toujours d'ici,
 * jamais directement de "gsap" : le plugin est enregistré une seule fois.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Mobile : la barre d'adresse qui se rétracte change la hauteur du viewport → sans cette option, chaque petit geste
  // recalcule tous les déclencheurs (saccades, scènes décalées).
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Les polices web et les images changent la hauteur du contenu APRÈS le premier calcul : on recale tous les déclencheurs.
  const refresh = () => ScrollTrigger.refresh();
  if (document.readyState === "complete") refresh();
  else window.addEventListener("load", refresh, { once: true });
  document.fonts?.ready.then(refresh);
  // Développement uniquement : permet de piloter GSAP à la main pendant les tests (volet d'aperçu masqué = pas de rAF). Absent en production.
  if (process.env.NODE_ENV !== "production") window.__gsap = { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger, useGSAP };
