"use client";

import { useRef } from "react";
import { origin } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import Subtitle from "@/components/ui/Subtitle";
import ScrollFillText from "@/components/ui/ScrollFillText";
import RevealText from "@/components/ui/RevealText";
import OriginVideo from "@/components/origin/OriginVideo";
import styles from "@/components/origin/origin.module.css";

const PIN_HEIGHT = { desktop: 250, mobile: 225 }; // % de la hauteur d'écran ; la différence avec 100 = longueur du scroll

/**
 * 06 — ORIGIN. Le reveal : la matérialisation de toute la vision, pas une simple plateforme vidéo.
 *
 * Scène 1 (scroll, sticky + scrub) : une ligne de lumière s'allume au centre → elle s'ouvre en écran 16:9 →
 * ORIGIN s'éclaire (balayage gauche → droite) → le sous-titre s'écrit mot par mot. L'écran est un cadre :
 * quand les maquettes de l'interface seront prêtes, elles remplaceront simplement son contenu.
 * Scène 2 (flux normal) : l'explication (texte qui se remplit), les formats (bandeau), « un seul espace ».
 *
 * Debug : `?debug` expose la timeline de la scène 1 sur window.__pthOrigin (dev uniquement).
 */
export default function Origin() {
  const root = useRef(null);
  const track = [...origin.catalogue, ...origin.catalogue];

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const debug = isDebugMode();
        el.dataset.motion = "on";
        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: debug });

        // Caméra : l'écran avance très légèrement pendant toute la scène.
        tl.fromTo("[data-stage]", { scale: 0.94 }, { scale: 1, duration: 10 }, 0);

        // 1 — La ligne s'allume au centre, s'étire, vacille une fois.
        tl.fromTo("[data-line]", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1.4, ease: "power2.out" }, 0.4);
        tl.to("[data-line]", { keyframes: { opacity: [0.35, 1, 0.6, 1], easeEach: "none" }, duration: 0.9 }, 1.5);
        tl.fromTo("[data-glow]", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 3.2, ease: "power1.out" }, 1.6);

        // 2 — La ligne s'ouvre en écran (rideau de cinéma), puis s'efface.
        tl.fromTo(
          "[data-screen]",
          { clipPath: "inset(50% 0% 50% 0% round 20px)" },
          { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 2.2, ease: "power2.inOut" },
          2.6,
        );
        tl.to("[data-line]", { opacity: 0, duration: 0.8 }, 3.6);

        // 3 — ORIGIN s'éclaire : balayage de lumière gauche → droite.
        tl.fromTo("[data-wordmark]", { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: 2.4, ease: "power2.inOut" }, 4.4);
        tl.fromTo("[data-tag]", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 6.6);

        // 4 — Le sous-titre s'écrit, mot par mot.
        tl.fromTo(
          "[data-subtitle] [data-w]",
          { opacity: 0, y: 6, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.16, ease: "power2.out" },
          6.4,
        );
        tl.set({}, {}, 10); // palier final : l'écran reste, le temps de le regarder

        if (debug) window.__pthOrigin = tl;
        else {
          ScrollTrigger.create({
            trigger: el.querySelector("[data-pin]"),
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            animation: tl,
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
      id={origin.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="origin-title"
      className={`${styles.section} grain`}
      style={{ "--pin-height": PIN_HEIGHT.desktop, "--pin-height-mobile": PIN_HEIGHT.mobile }}
    >
      {/* ── Scène 1 : le reveal ── */}
      <div data-pin className={styles.pin}>
        <div className={styles.sticky}>
          <div data-glow className={styles.glow} aria-hidden="true" />

          <div data-stage className={styles.stage}>
            <div className={styles.screenWrap}>
              <div data-screen className={styles.screen}>
                <OriginVideo />
                <h2 id="origin-title" data-wordmark className={styles.wordmark}>
                  {origin.name}
                </h2>
                <span data-tag className={styles.tag}>
                  {origin.status}
                </span>
              </div>
              <div data-line className={styles.line} aria-hidden="true" />
            </div>
            <Subtitle data-subtitle text={origin.subtitle} />
          </div>
        </div>
      </div>

      {/* ── Scène 2 : l'explication ── */}
      <div className={`${styles.content} atmo-glow-bottom`}>
        <div className="mx-auto max-w-[110rem]">
          <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
            <p className={styles.kicker}>{origin.kicker}</p>
            <ScrollFillText
              lines={[origin.intro]}
              wordClassName="text-silver"
              emClassName="text-accent"
              className="max-w-[34ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.2] tracking-[-0.05em] text-ivory"
            />
          </div>
        </div>

        <div className={`${styles.band} mt-[var(--space-block)]`}>
          <div aria-hidden="true" className="marquee-track">
            {track.map((item, i) => (
              <span key={i} className="flex items-center whitespace-nowrap text-[length:var(--text-headline)] font-normal tracking-[-0.05em] text-ivory/80">
                <span className="px-6">{item}</span>
                <span className="size-2 rounded-full bg-signal" />
              </span>
            ))}
          </div>
          <ul className="sr-only">
            {origin.catalogue.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-[var(--space-block)] max-w-[110rem]">
          <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
            <p className={styles.kicker}>{origin.closingKicker}</p>
            <RevealText as="p" className="max-w-[44ch] text-[length:var(--text-lead)] leading-relaxed text-ivory-dim">
              {origin.closing}
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
}
