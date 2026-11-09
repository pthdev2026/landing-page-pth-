"use client";

import { gsap } from "@/lib/gsap";
import { TIMELINE_UNITS as D, LETTERBOX, WELCOME_SHIFT as SH, STORY_BOUNDS, MOBILE_PAN } from "./heroConfig";

/**
 * TIMELINE DE LA HERO — « La question, la réponse, la bienvenue, la lumière ».
 *
 * Une seule timeline GSAP en pause, longue de D "unités" (voir heroConfig). Pas de durée réelle :
 * le scroll (ScrollTrigger scrub) ou le curseur ?debug pilote sa progression de 0 à 1.
 *
 * Principe de mise en scène : on ne dépense pas l'impact trop tôt. Le début est sobre (noir pur,
 * sous-titres petits, AU CENTRE, mot par mot, chacun sur FOND NOIR) ; le spectaculaire vient ensuite, quand la lumière arrive.
 *
 *   I.   LA QUESTION    0.5 → 5.8   noir pur, la question apparaît mot par mot, palier de lecture, elle s'efface
 *        LE SILENCE     5.8 → 6.6   noir complet
 *   II.  LA RÉPONSE     6.6 → 10.6  « Oui ! » puis « Et on veut le montrer. » mot par mot, palier, elle s'efface
 *        LA BIENVENUE   11.0 → 14.7 « Bienvenue chez PTH » (WELCOME) : mots à 11.0, ≈ 2 unités de lecture, s'efface à 14.0
 *   III. LA LUMIÈRE     10.6 → 15   les bandes s'ouvrent, les projecteurs s'allument un à un : c'est « le montrer »
 *   IV.  LA RÉVÉLATION  13.8 → 19   le mot TÉMOIGNAGE, le manifeste, le sous-texte, les boutons, le menu
 *        PALIER FINAL   19 → 20     on laisse respirer l'état final
 *   (III et IV sont écrites avec leurs temps d'origine dans `room`, décalée de WELCOME_SHIFT.)
 *
 * Les "paliers" (aucune tween) sont voulus : en scrub, ce sont des zones de scroll où l'image
 * reste posée, le temps de lire. Règle : on n'anime que opacity, transform et filter sur de petits éléments.
 */

/** Étapes → progression (curseur de debug). Les temps sont en unités ; on divise par D. */
export const STORYBOARD = [
  { id: "00", label: "Noir", at: 0 },
  { id: "Q1", label: "La question (mot par mot)", at: 1.6 / D },
  { id: "Q2", label: "La question (complète)", at: 4.0 / D },
  { id: "Q3", label: "Le silence", at: 6.2 / D },
  { id: "A1", label: "« Oui ! »", at: 7.1 / D },
  { id: "A2", label: "« Et on veut le montrer. »", at: 9.2 / D },
  ...(SH ? [{ id: "W", label: "« Bienvenue chez PTH »", at: 12.6 / D }] : []),
  { id: "L1", label: "Les projecteurs s'allument", at: (11.6 + SH) / D },
  { id: "L2", label: "La scène prend vie", at: (13.6 + SH) / D },
  { id: "R1", label: "Le mot se dévoile", at: (15.4 + SH) / D },
  { id: "R2", label: "Le manifeste", at: (17.6 + SH) / D },
  { id: "99", label: "Final", at: 1 },
];

/** Accès partagé pour le curseur de debug (un seul Hero par page). */
export const heroTimelineRef = { current: null };

export function buildHeroTimeline(root) {
  const q = gsap.utils.selector(root);
  const light = (key) => q(`[data-light="${key}"]`);
  const veil = q("[data-veil]");
  const word = q("[data-word]");
  const qWords = q("[data-intro-q] [data-w]");
  const aLead = q("[data-intro-a] [data-strong]"); // « Oui ! » : les mots forts arrivent en premier
  const aRest = q("[data-intro-a] [data-w]:not([data-strong])");
  const aAll = q("[data-intro-a] [data-w]");
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  // Apparition d'un sous-titre : chaque mot passe du flou au net (mise au point), comme un sous-titre qui s'écrit.
  const wordIn = { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" };
  const wordFrom = { opacity: 0, y: 6, filter: "blur(6px)" };

  const mobile = window.matchMedia("(max-width: 767px)").matches;

  // ── Segments « stories » (mobile) : chaque segment se remplit pendant son chapitre. ─────────────
  const fills = q("[data-story-fill]");
  fills.forEach((fill, i) => {
    tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: STORY_BOUNDS[i + 1] - STORY_BOUNDS[i], ease: "none" }, STORY_BOUNDS[i]);
  });

  // À la toute fin, les segments s'effacent (l'écran final reste propre ; la ligne d'avancement du site prend le relais).
  tl.to(q("[data-stories]"), { autoAlpha: 0, duration: 0.8 }, D - 0.9);

  // ── Caméra : avancée lente et continue sur toute la séquence ────────────
  tl.fromTo(q("[data-frame]"), { scale: 1 }, { scale: 1.045, ease: "none", duration: D }, 0);

  // ════════════ I — LA QUESTION (noir pur) ═══════════════════════════════
  // Le voile est totalement opaque : rien à voir, seulement les mots.
  tl.fromTo(veil, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0);

  // État initial : toutes les lumières éteintes. ⚠ À poser sur la timeline PRINCIPALE, pas dans `room` : quand la lecture
  // remonte avant le début de `room`, GSAP annule ses `set()` et rend aux lumières leur valeur naturelle (allumée) —
  // un visiteur qui remonte tout en haut verrait alors la salle éclairée.
  tl.set(q("[data-light]"), { opacity: 0, immediateRender: true }, 0);

  tl.fromTo(qWords, wordFrom, { ...wordIn, stagger: 0.24 }, 0.5);
  // Palier de lecture (≈ 3.3 → 5.0), puis la question s'efface d'un seul bloc.
  tl.to(qWords, { opacity: 0, filter: "blur(4px)", duration: 0.8, ease: "power2.in" }, 5.0);
  // (5.8 → 6.6 : LE SILENCE, noir complet, aucune tween)

  // ════════════ II — LA RÉPONSE ══════════════════════════════════════════
  tl.fromTo(aLead, wordFrom, { ...wordIn, stagger: 0.12 }, 6.6);
  tl.fromTo(aRest, wordFrom, { ...wordIn, stagger: 0.3 }, 7.3);
  // Palier (≈ 9.1 → 9.9), puis la réponse s'efface.
  tl.to(aAll, { opacity: 0, filter: "blur(4px)", duration: 0.7, ease: "power2.in" }, 9.9);

  // ════════════ « BIENVENUE » : la carte, au centre, sur noir ═════════════
  const welcome = q("[data-intro-w] [data-w]");
  if (welcome.length && SH) {
    // Les mots arrivent (11.0 → ≈ 12.1), puis la carte reste posée ≈ 2 unités : le temps de la lire, avant la lumière.
    tl.fromTo(welcome, wordFrom, { ...wordIn, stagger: 0.28 }, 11.0);
    tl.to(welcome, { opacity: 0, filter: "blur(4px)", duration: 0.7, ease: "power2.in" }, 14.0);
  }

  // III et IV (la salle s'allume, la révélation) sont écrites avec leurs temps d'origine dans une timeline
  // imbriquée, posée SH unités plus tard : la carte « Bienvenue » s'intercale sans toucher à un seul de ces temps.
  // ⚠ Aucun `set()` d'état initial ici (il serait annulé quand la lecture remonte avant `room`) : voir `tl.set(… data-light …)` plus haut.
  const room = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // ════════════ III — LA LUMIÈRE : « on veut le montrer » ════════════════
  // Les bandes cinémascope s'ouvrent : l'écran respire quand la lumière arrive.
  if (LETTERBOX) {
    room.to(q('[data-bar="top"]'), { scaleY: 0, duration: 1.3 }, 10.6);
    room.to(q('[data-bar="bottom"]'), { scaleY: 0, duration: 1.3 }, 10.6);
  }

  // Les projecteurs s'allument depuis le centre vers l'extérieur (symétrie du plateau).
  // Chacun vacille une fois (keyframes d'opacité), puis reste stable.
  const strikes = { b1: 10.8, b2: 11.05, b0: 11.5, b3: 11.75 };
  Object.entries(strikes).forEach(([key, at]) => {
    room.to(
      light(key),
      { keyframes: { opacity: [0.7, 0.3, 0.95, 1], easeEach: "none" }, duration: 1.1 },
      at,
    );
  });

  // L'écran de contrôle de la caméra s'allume, puis les projecteurs de côté
  // (la traînée de lumière n'apparaît qu'une fois, à gauche), le sol, la brume.
  // Mobile : le travelling latéral (MOBILE_PAN) balaie le plateau ; les lampes s'allument quand la caméra les atteint.
  const pan = mobile && MOBILE_PAN;
  room.to(light("monitor"), { opacity: 1, duration: 0.8 }, pan ? 12.0 : 11.4);
  room.to(light("left"), { opacity: 1, duration: 1.0 }, 12.4);
  room.fromTo(q("[data-flare]"), { opacity: 0, scaleX: 0.3 }, { opacity: 0.6, scaleX: 1, duration: 0.35, ease: "power2.out" }, 12.4);
  room.to(q("[data-flare]"), { opacity: 0, duration: 0.9 }, 12.75);
  room.to(light("right"), { opacity: 1, duration: 1.0 }, pan ? 13.3 : 12.9);
  room.to(light("floor"), { opacity: 1, duration: 1.6 }, 12.8);
  room.fromTo(q("[data-haze]"), { opacity: 0 }, { opacity: 0.8, duration: 3 }, 12.6);

  // Le voile se retire : d'abord à moitié, puis complètement pendant la révélation.
  room.to(veil, { opacity: 0.55, duration: 3.2, ease: "power1.in" }, 10.8);
  room.to(veil, { opacity: 0, duration: 2.4, ease: "power1.out" }, 14.8);

  // Travelling latéral (mobile) : le cadre 16:9 est plus large que l'écran portrait ; on balaie le plateau —
  // centre (projecteurs) → gauche (caméra, lampe) → droite (lampe) → retour au centre pour le mot TÉMOIGNAGE.
  // Tous les calques de la scène sont DANS le cadre : ils suivent. L'amplitude est bornée par la largeur réellement hors écran.
  if (pan) {
    const frame = q("[data-frame]");
    const overflow = frame.length ? ((frame[0].offsetWidth - window.innerWidth) / 2 / frame[0].offsetWidth) * 100 : 0;
    const shift = Math.max(0, Math.min(30, overflow * 0.92));
    if (shift > 4) {
      room.fromTo(frame, { xPercent: 0 }, { xPercent: shift, duration: 1.6, ease: "power2.inOut" }, 11.0);
      room.to(frame, { xPercent: -shift, duration: 1.7, ease: "power2.inOut" }, 12.6);
      room.to(frame, { xPercent: 0, duration: 1.6, ease: "power2.inOut" }, 14.3);
    }
  }

  // ════════════ IV — LA RÉVÉLATION ═══════════════════════════════════════
  // Le mot TÉMOIGNAGE se devine, se dévoile, puis s'affirme sur le mur.
  room.fromTo(word, { opacity: 0 }, { opacity: 0.14, duration: 1.2 }, 13.8)
    .to(word, { opacity: 0.42, duration: 1.0 }, 14.8)
    .to(word, { opacity: 0.95, duration: 1.8 }, 16.2);

  // Manifeste en deux temps.
  const lines = q("[data-line]");
  room.fromTo(lines[0], { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out" }, 16.4);
  room.fromTo(lines[1], { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out" }, 17.1);

  // Sous-texte, boutons, navigation.
  room.fromTo(q("[data-fade]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 17.7);
  room.fromTo(
    q("[data-cta]"),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
    18.1,
  );
  // Cartes de verre (mobile) : elles arrivent juste après les boutons.
  room.fromTo(q("[data-chip]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out" }, 18.9);
  const header = document.querySelector("[data-site-header]");
  if (header) room.fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 18.4);

  room.set({}, {}, 20);
  tl.add(room, SH);

  // Indication de scroll : disparaît dès le premier mouvement.
  tl.to(q("[data-hint]"), { autoAlpha: 0, duration: 0.4 }, 0.1);

  // Garantit la durée totale D (palier final : 1 unité de respiration).
  tl.set({}, {}, D);
  return tl;
}
