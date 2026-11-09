"use client";

import { useRef } from "react";
import { projectsPage as copy } from "@/content/fr";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import styles from "./projects.module.css";

/**
 * « Pourquoi ces projets existent » — bloc clair (brief §5). Titre + raisonnement en deux colonnes, puis les
 * cinq réalités concrètes (« Filmer », « Produire », « Structurer », « Diffuser », « Construire ») en frise
 * verticale — référence envoyée le 2026-10-21, structure reprise sans les photos (aucun visuel réel par étape).
 * Même ton clair (ivoire) que Promesse, mêmes tokens.
 *
 * Animation « ligne par ligne » (2026-10-21) : même recette que Promesse (`scaleY`/`scaleX` + `transform-origin`,
 * jamais `stroke-dashoffset` — réservé aux vrais tracés SVG comme la maison) — un timeline unique, déclenché une
 * fois à l'entrée : le trait vertical se tire de haut en bas pendant que chaque pastille puis son texte
 * apparaissent l'un après l'autre, au rythme où le trait les atteint.
 */
export default function ProjectsWhy() {
  const w = copy.why;
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (isDebugMode()) {
          el.dataset.motion = "off";
          return;
        }
        el.dataset.motion = "on";
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el.querySelector("[data-timeline]"), start: "top 75%", once: true },
        });
        tl.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: "power1.inOut" }, 0)
          .fromTo(
            "[data-dot]",
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.4, stagger: 0.32, ease: "back.out(2)" },
            0.08,
          )
          .fromTo(
            "[data-step-content]",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.32, ease: "power3.out" },
            0.16,
          );
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
      ref={root}
      data-motion="pending"
      id={w.id}
      data-light-section
      aria-labelledby="projects-why-title"
      className={`${styles.light} px-[var(--space-gutter)] py-[var(--space-section)]`}
    >
      <div className="mx-auto max-w-[110rem]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div data-reveal>
            <h2 id="projects-why-title" className="max-w-[16ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em]">
              {w.title}
            </h2>
          </div>

          <div data-reveal className="flex max-w-[68ch] flex-col gap-5">
            {w.text.map((p) => (
              <p key={p} className={`text-[length:var(--text-lead)] leading-relaxed ${styles.lightDim}`}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div data-timeline className={`${styles.timeline} mt-[var(--space-block)]`}>
          <div data-line aria-hidden="true" className={styles.timelineLine} />
          <ul>
            {w.realities.map((r, i) => (
              <li key={r.title} className={styles.timelineStep}>
                <span data-dot className={styles.timelineDot} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div data-step-content className={styles.timelineContent}>
                  <p className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em]">{r.title}</p>
                  <p className={`text-[length:var(--text-body)] leading-relaxed ${styles.lightDim}`}>{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p data-reveal className="mt-[var(--space-block)] max-w-[48ch] text-[length:var(--text-lead)] font-normal leading-relaxed">
          {w.closing}
        </p>
      </div>
    </section>
  );
}
