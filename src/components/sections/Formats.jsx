"use client";

import { useRef } from "react";
import Image from "next/image";
import { formats } from "@/content/fr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import Accent from "@/components/ui/Accent";
import styles from "@/components/formats/formats.module.css";

const TINTS = [
  "rgba(143,18,32,0.6)",
  "rgba(180,69,47,0.5)",
  "rgba(74,10,16,0.85)",
  "rgba(196,84,40,0.45)",
  "rgba(143,18,32,0.45)",
  "rgba(120,20,30,0.7)",
  "rgba(180,69,47,0.42)",
];

/** Visuel d'un format : image réelle si fournie, sinon placeholder teinté. */
function Visual({ item, index, className = "" }) {
  const num = String(index + 1).padStart(2, "0");
  if (item.image) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 40vw, 92vw"
          className="object-cover"
          style={item.focus ? { objectPosition: item.focus } : undefined}
        />
      </div>
    );
  }
  return (
    <div className={`${styles.placeholder} ${className}`} style={{ "--tint": TINTS[index % TINTS.length] }}>
      <span className={styles.big} aria-hidden="true">
        {num}
      </span>
      <span className={styles.tag}>{formats.status}</span>
    </div>
  );
}

/**
 * 08 — CE QU'ON TROUVERA SUR ORIGIN. « Rendre la vision concrète » : sept formats.
 * Desktop : index éditorial à filets à gauche ; à droite, un cadre collant dont le visuel change avec la ligne active.
 * Mobile : le MÊME cadre, en haut, collé sous le menu (l'enveloppe elle-même est `sticky`, car c'est elle l'enfant direct de la colonne haute).
 * (la ligne qui traverse 62 % de la hauteur d'écran devient active).
 * L'état actif est un attribut `data-on` posé par ScrollTrigger (changement d'état, pas une animation :
 * il fonctionne aussi avec « réduire les animations »).
 */
/** Touche une vignette de la pellicule : on va à la ligne correspondante (le cadre du haut suit tout seul). */
function goToRow(section, i) {
  const row = section?.querySelectorAll("[data-row]")[i];
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  row?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
}

export default function Formats() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const rows = [...el.querySelectorAll("[data-row]")];
      const visuals = [...el.querySelectorAll("[data-visual]")];
      const thumbs = [...el.querySelectorAll("[data-thumb]")];
      const list = el.querySelector("[data-list]");

      const setActive = (i) => {
        rows.forEach((row, k) => row.toggleAttribute("data-on", k === i));
        visuals.forEach((v, k) => v.toggleAttribute("data-on", k === i));
        thumbs.forEach((t, k) => {
          t.toggleAttribute("data-on", k === i);
          if (k === i) t.setAttribute("aria-current", "true");
          else t.removeAttribute("aria-current");
        });
      };
      list.setAttribute("data-live", "");
      setActive(0);
      if (isDebugMode()) window.__pthFormats = setActive;

      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });

      return () => list.removeAttribute("data-live");
    },
    { scope: root },
  );

  return (
    <section
      id={formats.id}
      ref={root}
      aria-labelledby="formats-title"
      className="atmo-glow-top px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[110rem]">
        <h2
          id="formats-title"
          data-reveal
          className="max-w-[20ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
        >
          <Accent text={formats.title} />
        </h2>

        <div className="mt-[var(--space-block)] flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <ul data-list className={styles.list}>
            {formats.items.map((item, i) => (
              <li key={item.title} data-row className={styles.row}>
                <span data-reveal="fade" className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <h3 data-reveal data-reveal-delay="0.06" className={`${styles.name} text-silver`}>{item.title}</h3>
                <p data-reveal data-reveal-delay="0.14" className={styles.text}>{item.text}</p>
              </li>
            ))}
          </ul>

          {/* Cadre collant, un visuel par format, seul l'actif est visible. Bureau : à droite. Mobile : EN HAUT (order-first),
              il reste collé sous le menu pendant que les descriptions défilent dessous et changent son image. */}
          <div className="max-lg:sticky max-lg:top-[4.5rem] max-lg:z-[3] max-lg:order-first">
            <div className={styles.panel} aria-hidden="true">
              <div className={styles.frame}>
                {formats.items.map((item, i) => (
                  <div key={item.title} data-visual className={styles.visual}>
                    <Visual item={item} index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile : la « pellicule » — une vignette par format (idée reprise du sélecteur de miniatures du mobile de Saki).
                Elle montre où l'on en est et permet de sauter d'un format à l'autre d'un toucher. */}
            <ul className={`${styles.strip} lg:hidden`} aria-label="Formats">
              {formats.items.map((item, i) => (
                <li key={item.title}>
                  <button type="button" data-thumb aria-label={item.title} onClick={() => goToRow(root.current, i)} className={styles.thumb}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                        style={item.focus ? { objectPosition: item.focus } : undefined}
                      />
                    ) : (
                      <span className={styles.thumbNum}>{i + 1}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
