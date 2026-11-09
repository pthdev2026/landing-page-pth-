"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./globe.module.css";

/**
 * Enveloppe légère : ne charge `GlobeMap` (maplibre-gl, ~800 Ko) qu'à l'approche de l'écran (IntersectionObserver),
 * jamais dans le paquet JS initial de la page. Toujours `aria-hidden` (décoratif — le vrai chiffre est juste en
 * dessous dans la section Chiffres, voir Stats.jsx).
 */
export default function Globe({ className = "" }) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [GlobeMap, setGlobeMap] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || GlobeMap) return;
    import("@/components/ui/GlobeMap")
      .then((mod) => setGlobeMap(() => mod.default))
      .catch(() => {}); // décoratif : une carte qui ne charge pas ne doit jamais casser la page
  }, [visible, GlobeMap]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={`${styles.wrap} ${className}`}>
      <div className={styles.stars} aria-hidden="true" />
      {GlobeMap ? <GlobeMap mobile={typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches} /> : null}
      <div className={styles.fadeTop} />
      <div className={styles.fadeBottom} />
    </div>
  );
}
