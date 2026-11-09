"use client";

import { useRef } from "react";
import { house } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import { parseEmphasis } from "@/lib/text";
import ScrollFillText from "@/components/ui/ScrollFillText";
import RevealText from "@/components/ui/RevealText";
import styles from "@/components/maison/maison.module.css";

const PIN_HEIGHT = { desktop: 215, mobile: 200 }; // % de la hauteur d'écran ; la différence avec 100 = longueur du scroll
const DOTS = 16;

/** Générateur pseudo-aléatoire déterministe : mêmes positions côté serveur et client. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = seeded(90210);
// Points répartis sur le pourtour de l'écran (jamais au centre : ils viennent DE l'extérieur vers la porte).
const dots = Array.from({ length: DOTS }, () => {
  const side = rand();
  const along = 4 + rand() * 92;
  const near = rand() * 14;
  const p = side < 0.34 ? { left: along, top: near } : side < 0.67 ? { left: near, top: 20 + rand() * 70 } : { left: 100 - near, top: 20 + rand() * 70 };
  return { ...p, size: 2 + Math.round(rand() * 2), alpha: 0.4 + rand() * 0.4 };
});

/**
 * 09 — LA MAISON D'ORIGIN. « Construire la maison du contenu chrétien de notre génération. »
 * Scène 1 (scroll, sticky + scrub) : la maison se dessine en traits fins → la porte s'allume, la lumière se répand
 * → les histoires (points de lumière, comme dans « Notre ambition ») entrent par la porte → la phrase apparaît.
 * Scène 2 (flux normal) : les phrases du brief ; « chaque chrétien » et « une personne qui ne connaît pas encore Christ »
 * sont côte à côte pour montrer l'ouverture d'Origin au-delà du cercle chrétien.
 * Debug : `?debug` expose la timeline sur window.__pthMaison.
 */
export default function Maison() {
  const root = useRef(null);
  const words = parseEmphasis(house.statement);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const debug = isDebugMode();
        el.dataset.motion = "on";
        const sticky = el.querySelector("[data-sticky]");
        const door = el.querySelector("[data-door]");

        // Distance de chaque point jusqu'à la porte (recalculée à chaque refresh : redimensionnement, rotation…).
        const toDoor = (axis) => (_, dot) => {
          const s = sticky.getBoundingClientRect();
          const d = door.getBoundingClientRect();
          const p = dot.getBoundingClientRect();
          return axis === "x"
            ? d.left + d.width / 2 - (p.left + p.width / 2)
            : d.top + d.height * 0.7 - (p.top + p.height / 2);
        };

        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: debug });

        tl.fromTo("[data-stage]", { scale: 0.96 }, { scale: 1, duration: 10 }, 0);

        // 1 — La maison se dessine : toit, murs, sol, cadre de la porte.
        tl.fromTo("[data-stroke]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.55, ease: "power2.inOut" }, 0.3);

        // 2 — La porte s'allume ; la lumière déborde sur le sol et dans la nuit.
        tl.fromTo("[data-doorlight]", { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" }, 3.4);
        tl.fromTo("[data-beam]", { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" }, 4.1);
        tl.fromTo("[data-glow]", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 2.6, ease: "power1.out" }, 3.6);

        // 3 — Les histoires arrivent de l'extérieur, entrent par la porte, disparaissent dans la lumière.
        tl.fromTo("[data-dot]", { opacity: 0 }, { opacity: (i, t) => t.dataset.alpha, duration: 0.8, stagger: { amount: 0.8 } }, 2.6);
        tl.to("[data-dot]", { x: toDoor("x"), y: toDoor("y"), duration: 3.2, ease: "power2.inOut", stagger: { amount: 1.2 } }, 4.6);
        tl.to("[data-dot]", { opacity: 0, scale: 0, duration: 0.5, stagger: { amount: 1.2 } }, 7.0);

        // 4 — La phrase apparaît, mot par mot.
        tl.fromTo(
          "[data-statement] [data-w]",
          { opacity: 0, y: 8, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.14, ease: "power2.out" },
          6.6,
        );
        tl.set({}, {}, 10);

        if (debug) window.__pthMaison = tl;
        else {
          ScrollTrigger.create({
            trigger: el.querySelector("[data-pin]"),
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            animation: tl,
            invalidateOnRefresh: true,
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
      id={house.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="maison-title"
      className={`${styles.section} grain`}
      style={{ "--pin-height": PIN_HEIGHT.desktop, "--pin-height-mobile": PIN_HEIGHT.mobile }}
    >
      {/* ── Scène 1 : la maison ── */}
      <div data-pin className={styles.pin}>
        <div data-sticky className={styles.sticky}>
          <div data-glow className={styles.glow} aria-hidden="true" />
          {dots.map((d, i) => (
            <span
              key={i}
              data-dot
              data-alpha={d.alpha.toFixed(2)}
              aria-hidden="true"
              className={styles.dot}
              style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, opacity: d.alpha }}
            />
          ))}

          <div data-stage className={styles.stage}>
            <svg className={styles.house} viewBox="0 0 240 190" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="groundFade" gradientUnits="userSpaceOnUse" x1="0" x2="240" y1="0" y2="0">
                  <stop offset="0" stopColor="rgba(244,239,230,0)" />
                  <stop offset="0.5" stopColor="rgba(244,239,230,0.55)" />
                  <stop offset="1" stopColor="rgba(244,239,230,0)" />
                </linearGradient>
                <linearGradient id="doorGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#ffcf94" />
                  <stop offset="0.55" stopColor="#e8763a" />
                  <stop offset="1" stopColor="#b3232b" />
                </linearGradient>
                <linearGradient id="beamGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="rgba(255,190,130,0.55)" />
                  <stop offset="1" stopColor="rgba(255,190,130,0)" />
                </linearGradient>
              </defs>
              {/* Faisceau de lumière au sol, sous la porte */}
              <polygon data-beam className={styles.beam} points="104,170 136,170 178,190 62,190" />
              {/* Porte allumée */}
              <rect data-doorlight data-door className={styles.doorLight} x="104" y="120" width="32" height="50" />
              {/* Tracés : toit, murs, cadre de porte, sol (pathLength=1 pour l'animation de tracé) */}
              <path data-stroke pathLength="1" className={styles.stroke} d="M20 98 L120 20 L220 98" />
              <path data-stroke pathLength="1" className={styles.stroke} d="M40 86 V170 H200 V86" />
              <path data-stroke pathLength="1" className={styles.stroke} d="M104 170 V120 H136 V170" />
              <path data-stroke pathLength="1" className={`${styles.stroke} ${styles.ground}`} d="M0 170 H240" />
            </svg>

            <h2 id="maison-title" data-statement className={styles.statement}>
              {words.map((t, i) => (
                <span key={i}>
                  <span data-w className={`${styles.word} ${t.strong ? "text-accent" : ""}`}>
                    {t.text}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      {/* ── Scène 2 : les phrases du brief ── */}
      <div className={styles.content}>
        <div className="mx-auto max-w-[110rem]">
          <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
            <div aria-hidden="true" className="hidden lg:block" />
            <RevealText as="p" className="max-w-[34ch] text-[length:var(--text-lead)] leading-snug text-ivory-dim">
              {house.lead}
            </RevealText>
          </div>

          <div className="mt-[var(--space-sub)] grid gap-8 lg:grid-cols-[1fr_2.2fr]">
            <div aria-hidden="true" className="hidden lg:block" />
            <ScrollFillText
              lines={[house.platform]}
              wordClassName="text-silver"
              className="max-w-[34ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
            />
          </div>

          <div className="mt-[var(--space-block)] grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div className={styles.col}>
              <ScrollFillText
                lines={[house.believers]}
                wordClassName="text-silver"
                className="max-w-[26ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
              />
            </div>
            <div className={styles.col}>
              <ScrollFillText
                lines={[house.seekers]}
                wordClassName="text-silver"
                emClassName="text-accent"
                className="max-w-[30ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
