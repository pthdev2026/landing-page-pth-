"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./projects.module.css";

/**
 * Les trois dimensions d'ORIGIN (Raconter/Rassembler/Redistribuer) — scroll horizontal (demande du 2026-10-18,
 * référence : roomandpillar.com/our-focus). Refonte en vraies cartes qui glissent (demande du 2026-10-21,
 * référence grof.io : structure de « slide » reprise, jamais ses couleurs) — remplace l'ancien duo onglets +
 * panneau de texte unique par une piste de cartes numérotées (1 carte entière à la fois sur mobile, 2 puis 3
 * à partir de sm/lg — jamais un bout de carte suivante qui dépasse : ça a été pris pour une carte vide, retour
 * utilisateur du 2026-10-21). Scroll natif (`overflow-x: auto` + `scroll-snap`), pas un pin/scrub GSAP :
 * fonctionne pareil au doigt (mobile) qu'à la molette/au clic (bureau), sans les pièges d'un scroll-jacking sur
 * Safari iOS (voir AGENTS.md — jamais `overflow-x: hidden` sur un ancêtre, ici l'`overflow-x: auto` reste local
 * à ce bloc).
 */
export default function OriginDimensions({ dimensions }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children];
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) setActive(cards.indexOf(mostVisible.target));
      },
      { root: track, threshold: [0.6] },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    const card = track?.children[i];
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <div className={styles.hScrollWrap}>
      <div ref={trackRef} role="list" aria-label="Les trois dimensions d'ORIGIN" className={styles.dimTrack}>
        {dimensions.map((d, i) => (
          <div key={d.title} role="listitem" className={styles.dimCard}>
            <span className={styles.dimNumber} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-silver">{d.title}</p>
            <p className="mt-3 text-[length:var(--text-body)] leading-relaxed text-ivory-dim">{d.text}</p>
          </div>
        ))}
      </div>

      <div className={styles.hArrows}>
        {dimensions.map((d, i) => (
          <button
            key={d.title}
            type="button"
            aria-label={`Aller à « ${d.title} »`}
            aria-current={active === i ? "true" : undefined}
            onClick={() => goTo(i)}
            className={styles.dimDot}
          />
        ))}
        <span className="flex-1" aria-hidden="true" />
        <button type="button" aria-label="Dimension précédente" disabled={active === 0} onClick={() => goTo(active - 1)} className={styles.hArrowBtn}>
          <svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M17 6H2M7 1 2 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Dimension suivante"
          disabled={active === dimensions.length - 1}
          onClick={() => goTo(active + 1)}
          className={styles.hArrowBtn}
        >
          <svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
