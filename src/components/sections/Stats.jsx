"use client";

import { useRef } from "react";
import { stats } from "@/content/fr";
import { gsap, useGSAP } from "@/lib/gsap";
import { isDebugMode } from "@/lib/debug";
import ScrollFillText from "@/components/ui/ScrollFillText";
import Accent from "@/components/ui/Accent";
import Globe from "@/components/ui/Globe";
import styles from "@/components/stats/stats.module.css";

/** Formate un nombre à la française avec `decimals` décimales (ex. 19,1). */
const fmt = (n, decimals = 0) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

/**
 * 04 — NOS CHIFFRES. Preuve : PTH n'est pas qu'une idée, il existe déjà une communauté.
 * Inspiration : rangée de chiffres à filets (Fabrica / Gander), étiquettes numérotées (DARIUSU) — sans cartes.
 *
 * Données : `stats.items` dans fr.js. Une ligne dont `value` est null n'est PAS affichée (jamais de chiffre inventé,
 * jamais de « XX » en public). Les chiffres réels s'animent en compteur au scroll (décimales gérées).
 * Rangée 1 = les plateformes ; rangée 2 = le chiffre principal (`wide`), plus grand.
 */
export default function Stats() {
  const root = useRef(null);
  // Seules les données réelles s'affichent : d'abord les plateformes, puis le(s) chiffre(s) principal(aux).
  const live = stats.items.filter((item) => item.value !== null);
  const giant = live.find((i) => i.wide && i.unit); // « +3 M personnes touchées »
  const rows = [live.filter((i) => !i.wide), live.filter((i) => i.wide)].filter((row) => row.length > 0);

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
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: "[data-grid]", start: "top 78%", once: true },
        });
        tl.fromTo("[data-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1.4, stagger: 0.18 }, 0)
          .fromTo("[data-cell]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.2);

        // Compteurs : uniquement pour les valeurs réelles (data-value).
        gsap.utils.toArray("[data-count]").forEach((node) => {
          const target = Number(node.dataset.value);
          const decimals = Number(node.dataset.decimals || 0);
          const counter = { v: 0 };
          tl.to(
            counter,
            { v: target, duration: 2, ease: "power2.out", onUpdate: () => (node.textContent = fmt(counter.v, decimals)) },
            0.4,
          );
        });
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
      id={stats.id}
      ref={root}
      data-motion="pending"
      aria-labelledby="stats-title"
      className={`${styles.section} atmo-cool px-[var(--space-gutter)] py-[var(--space-section)]`}
    >
      {/* Chiffre géant coupé en fond (référence « stories ») : décor, jamais lu ; valeur lue dans fr.js (aucun chiffre en dur). */}
      {giant ? (
        <div aria-hidden="true" className={styles.giantClip}>
          <span className={styles.giant}>
            {giant.prefix ?? ""}
            {giant.value}
            {giant.suffix ?? ""}
          </span>
        </div>
      ) : null}
      <div className="relative mx-auto max-w-[110rem]">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2
            id="stats-title"
            data-reveal
            className="max-w-[22ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
          >
            <Accent text={stats.title} />
          </h2>
          <p data-reveal className="max-w-md text-[length:var(--text-lead)] leading-snug text-ivory-dim lg:justify-self-end">
            {stats.intro}
          </p>
        </div>
      </div>

      {/* Le monde : plein écran, pas une vignette dans une carte — le globe est décoratif (aria-hidden dans le
          composant), les chiffres plus bas portent la donnée réelle. Déborde volontairement de la marge et de la
          largeur maximale de la section (mx-[calc(50%-50vw)] w-screen) pour occuper tout l'écran. */}
      <div data-reveal="fade" className="relative mx-[calc(50%-50vw)] mt-[var(--space-block)] w-screen">
        <Globe />
      </div>

      <div className="relative mx-auto max-w-[110rem]">
        <div data-grid className="mt-[var(--space-block)]">
          {rows.map((row, r) => (
            <div key={r}>
              <div data-rule className={styles.rule} aria-hidden="true" />
              <dl className={styles.list} style={{ "--cols": row.length }}>
                {row.map((item) => {
                  return (
                    <div key={item.label} data-cell className={styles.cell}>
                      <dt className={styles.label}>{item.label}</dt>
                      <dd className="mt-0 sm:mt-6">
                        <span className={`${styles.figure} ${item.wide ? styles.figureWide : ""}`}>
                          {item.prefix ? <span>{item.prefix}</span> : null}
                          <span data-count data-value={item.value} data-decimals={item.decimals ?? 0}>
                            {fmt(item.value, item.decimals ?? 0)}
                          </span>
                          {item.suffix ? <span className="ml-[0.18em]">{item.suffix}</span> : null}
                        </span>
                        {item.unit ? <span className={styles.unit}>{item.unit}</span> : null}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
          <div data-rule className={styles.rule} aria-hidden="true" />
        </div>

        <ScrollFillText
          cine
          lines={stats.closing}
          wordClassName="text-silver"
          emClassName="text-accent"
          className="mt-[var(--space-block)] max-w-3xl font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
        />
      </div>
    </section>
  );
}
