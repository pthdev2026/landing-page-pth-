"use client";

import { useRef } from "react";
import { ending } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import Subtitle from "@/components/ui/Subtitle";
import Logo from "@/components/ui/Logo";
import styles from "@/components/ending/ending.module.css";

const PIN_HEIGHT = { desktop: 230, mobile: 210 }; // % de la hauteur d'écran ; la différence avec 100 = longueur du scroll

/**
 * 15 — LA FIN DU FILM. La boucle se ferme : la Hero s'ouvrait sur une salle qui s'allume avec une question ;
 * le site se termine sur la même salle qui s'éteint, avec la dernière phrase, puis la carte de fin.
 *   0 → 3   la scène du plateau revient (fondu depuis le noir), vide et éclairée
 *   3 → 6   les lumières s'éteignent, les bandes cinémascope se referment (5.2)
 *   5.6 → 8 la dernière phrase s'écrit mot par mot (sous-titre, comme la question de la Hero)
 *   8.8 →   la carte de fin : « PTH — Partage Ton Histoire »
 * Textes du brief (§15) dans `ending` de fr.js. Debug : `?debug` expose la timeline sur window.__pthEnding.
 */
export default function Ending() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const debug = isDebugMode();
        el.dataset.motion = "on";
        const tl = gsap.timeline({ defaults: { ease: "none" }, paused: debug });
        const wordFrom = { opacity: 0, y: 6, filter: "blur(6px)" };
        const wordIn = { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" };

        // La salle revient de l'obscurité, puis reste posée un instant.
        tl.fromTo("[data-veil]", { opacity: 1 }, { opacity: 0, duration: 1.6, ease: "power2.out" }, 0.2);
        tl.fromTo("[data-frame]", { scale: 1.05 }, { scale: 1, duration: 11 }, 0);

        // Les lumières s'éteignent ; les bandes cinémascope se referment.
        tl.to("[data-veil]", { opacity: 1, duration: 3.0, ease: "power1.inOut" }, 3.0);
        tl.fromTo("[data-bar]", { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: "power2.inOut" }, 5.2);

        // Dans le noir : la dernière phrase, mot par mot ; elle s'efface avant la carte de fin.
        tl.fromTo("[data-sentence] [data-w]", wordFrom, { ...wordIn, stagger: 0.22 }, 5.6);
        tl.to("[data-sentence] [data-w]", { opacity: 0.35, duration: 0.8, ease: "power2.inOut" }, 8.4);

        // La carte de fin : « PTH — Partage Ton Histoire ».
        tl.fromTo("[data-brand]", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 8.6);
        tl.fromTo("[data-fullname] [data-w]", wordFrom, { ...wordIn, stagger: 0.18 }, 9.6);
        tl.set({}, {}, 11);

        if (debug) window.__pthEnding = tl;
        else {
          ScrollTrigger.create({
            trigger: el,
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
      id={ending.id}
      ref={root}
      data-motion="pending"
      aria-label="Fin"
      className={`${styles.section} grain grain-live`}
      style={{ "--pin-height": PIN_HEIGHT.desktop, "--pin-height-mobile": PIN_HEIGHT.mobile }}
    >
      <div className={styles.sticky}>
        <div data-frame className={styles.frame} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/images/hero-stage.webp" alt="" draggable={false} className={styles.plate} />
          <div data-veil className={styles.veil} />
          <div className={styles.vignette} />
        </div>
        <div data-bar className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
        <div data-bar className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />

        <div className={styles.stack}>
          <Subtitle data-sentence text={ending.sentence} />
          <div className="flex flex-col items-center gap-6">
            <Logo data-brand label={ending.brand} className={styles.brand} />
            <Subtitle data-fullname text={ending.fullName} />
          </div>
        </div>
      </div>
    </section>
  );
}
