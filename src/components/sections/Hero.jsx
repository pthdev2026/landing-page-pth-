"use client";

import { useRef } from "react";
import { hero } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import CTAButton from "@/components/ui/CTAButton";
import HeroStage from "@/components/hero/HeroStage";
import HeroDebug from "@/components/hero/HeroDebug";
import HeroIntro from "@/components/hero/HeroIntro";
import HeroOverlays from "@/components/hero/HeroOverlays";
import HeroStories from "@/components/hero/HeroStories";
import HeroChips from "@/components/hero/HeroChips";
import { SCROLL_DISTANCE, WELCOME, MOBILE_STORIES, MOBILE_CHIPS } from "@/components/hero/heroConfig";
import { stripEmphasis } from "@/lib/text";
import { buildHeroTimeline, heroTimelineRef } from "@/components/hero/heroTimeline";
import styles from "@/components/hero/hero.module.css";

/**
 * 01 — HERO. « La question, la réponse, la lumière. »
 * Idée : PTH est un vrai média (plateau d'interview). Dans le noir, une question puis sa réponse, en sous-titres
 * sobres ; puis la lumière s'allume pour « le montrer » : le témoignage.
 *
 * Fonctionnement :
 *  1. HeroStage = l'image de scène étalonnée + calques de lumière ; HeroOverlays = vignette, fondu, bandes ;
 *     HeroIntro = la question et la réponse.
 *  2. heroTimeline.js = une timeline GSAP en pause : 3 actes (question / réponse / révélation).
 *  3. ScrollTrigger épingle la section et relie le scroll natif à la progression de la timeline
 *     (pin + scrub). Pas de verrouillage de la page : clavier, barre de défilement et inertie tactile marchent.
 *  4. « Réduire les animations » : aucune timeline, on affiche directement l'état final.
 *
 * Debug : ajouter ?debug à l'URL pour piloter la timeline à la main (voir HeroDebug.jsx).
 */
export default function Hero() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      // Longueur du scroll épinglé, en % de la hauteur d'écran (plus court sur mobile).
      const play = (scrollDistance) => {
        el.dataset.motion = "on";
        const tl = buildHeroTimeline(el);
        heroTimelineRef.current = tl;
        const debug = new URLSearchParams(window.location.search).has("debug");

        if (!debug) {
          ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: `+=${scrollDistance}%`,
            pin: true,
            scrub: 0.6, // lissage : la timeline rattrape le scroll en ~0,6 s
            anticipatePin: 1,
            animation: tl,
          });
        }
        return () => {
          heroTimelineRef.current = null;
          el.dataset.motion = "pending";
        };
      };

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => play(SCROLL_DISTANCE.desktop));
      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () => play(SCROLL_DISTANCE.mobile));
      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.dataset.motion = "off"; // état final direct, aucune animation
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      data-hero
      data-motion="pending"
      aria-labelledby="hero-title"
      className={`${styles.root} grain grain-live`}
    >
      {/* Sans JavaScript : tout le contenu reste lisible. */}
      <noscript>
        <style>{`[data-hero] [data-veil]{opacity:0!important}[data-hero] *{opacity:1;transform:none!important;visibility:visible!important}[data-intro],[data-bar]{display:none!important}[data-hero] [data-light],[data-hero] [data-haze]{opacity:1}[data-site-header]{visibility:visible!important}`}</style>
      </noscript>

      {/* Version texte de l'intro pour les lecteurs d'écran (l'intro animée est aria-hidden). */}
      <p className="sr-only">
        {stripEmphasis(hero.intro.question)} {stripEmphasis(hero.intro.answer)}
        {WELCOME ? ` ${stripEmphasis(hero.intro.welcome)}` : ""}
      </p>

      <HeroStage word={hero.backdropWord} />
      <HeroOverlays />
      {MOBILE_STORIES ? <HeroStories /> : null}
      <HeroIntro
        question={hero.intro.question}
        answer={hero.intro.answer}
        welcome={WELCOME ? hero.intro.welcome : undefined}
      />

      <div className={styles.content}>
        <h1 id="hero-title" className={styles.headline}>
          <span className={styles.lineMask}>
            <span data-line className={styles.lineInner}>
              {hero.headline.lines[0]}
            </span>
          </span>
          <span className={styles.lineMask}>
            <span data-line className={styles.lineInner}>
              {hero.headline.lines[1]} <span className={styles.accent}>{hero.headline.accent}</span>
            </span>
          </span>
        </h1>

        <p data-fade className={styles.subtext}>
          {hero.subtext}
        </p>

        <div className={styles.ctas}>
          {hero.ctas.map((cta) => (
            <span key={cta.label} data-cta>
              <CTAButton href={cta.href} mode={cta.mode} variant={cta.variant} arrow>
                {cta.label}
              </CTAButton>
            </span>
          ))}
        </div>
      </div>

      {MOBILE_CHIPS ? <HeroChips /> : null}

      <div data-hint aria-hidden="true" className={styles.hint}>
        <span className={styles.hintLabel}>
          <span className={styles.hintDesktop}>{hero.scrollHint}</span>
          <span className={styles.hintTouch}>{hero.scrollHintTouch}</span>
        </span>
        <span className={styles.hintCue} />
      </div>

      <HeroDebug />
    </section>
  );
}
