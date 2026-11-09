"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Panneau de diagnostic, visible UNIQUEMENT avec `?diag` dans l'adresse (rien n'est affiché sinon, aucune donnée envoyée).
 * Sert à comprendre ce qu'un navigateur précis fait réellement quand une animation « disparaît » :
 * on ouvre la page avec `?diag`, on défile un peu, on prend une capture du panneau.
 * Tout est lu localement dans la page ; rien ne quitte le navigateur.
 */
export default function Diagnostics() {
  const box = useRef(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("diag")) return;

    const errors = [];
    const onError = (e) => errors.push(String(e.message || e.reason || e).slice(0, 110));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);

    // Images par seconde réellement produites par le navigateur.
    let frames = 0;
    let fps = 0;
    let raf;
    const count = () => {
      frames++;
      raf = requestAnimationFrame(count);
    };
    raf = requestAnimationFrame(count);
    let last = performance.now();

    const el = document.createElement("pre");
    el.style.cssText =
      "position:fixed;left:8px;bottom:8px;z-index:2147483647;margin:0;max-width:calc(100vw - 16px);max-height:70vh;overflow:auto;" +
      "padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.88);color:#8f8;font:11px/1.45 ui-monospace,Menlo,monospace;" +
      "white-space:pre-wrap;word-break:break-word;pointer-events:none";
    document.body.appendChild(el);
    box.current = el;

    const stickyState = () => {
      const scenes = [...document.querySelectorAll("main section")].filter((s) => s.querySelector("[class*='sticky']"));
      return scenes
        .map((s) => {
          const r = s.getBoundingClientRect();
          const inside = r.top <= 0 && r.bottom >= innerHeight;
          const st = s.querySelector("[class*='sticky']");
          const top = Math.round(st.getBoundingClientRect().top);
          return `${s.id}:${inside ? (Math.abs(top) <= 1 ? "COLLÉ" : "PAS COLLÉ(top=" + top + ")") : "hors-champ"}`;
        })
        .join("  ");
    };

    const update = () => {
      const now = performance.now();
      fps = Math.round((frames * 1000) / (now - last));
      frames = 0;
      last = now;
      const de = document.documentElement;
      const modes = [...document.querySelectorAll("main > section")].map((s) => `${s.id}:${s.dataset.motion || "-"}`).join(" ");
      const triggers = ScrollTrigger.getAll();
      const reveals = [...document.querySelectorAll("[data-reveal]")];
      const shown = reveals.filter((e) => +getComputedStyle(e).opacity > 0.95).length;
      el.textContent = [
        `PTH diag — ${new Date().toLocaleTimeString()}`,
        `navigateur: ${navigator.userAgent.replace(/Mozilla\/5.0 /, "").slice(0, 90)}`,
        `fenêtre: ${innerWidth}×${innerHeight}  cadre: ${de.clientWidth}  barre défil.: ${innerWidth - de.clientWidth}px  dpr:${devicePixelRatio}`,
        `scrollX: ${Math.round(scrollX)}  scrollY: ${Math.round(scrollY)}  largeur contenu: ${de.scrollWidth} ${de.scrollWidth > de.clientWidth ? "⚠ DÉBORDE de " + (de.scrollWidth - de.clientWidth) + "px" : "ok"}`,
        `mouvement réduit: ${matchMedia("(prefers-reduced-motion: reduce)").matches}  pointeur: ${matchMedia("(pointer: coarse)").matches ? "tactile" : "souris"}  visible: ${document.visibilityState}`,
        `supporte: overflow-clip=${CSS.supports("overflow-x", "clip")}  svh=${CSS.supports("height", "1svh")}  :has=${CSS.supports("selector(:has(a))")}`,
        `body overflow-x: ${getComputedStyle(document.body).overflowX}  html overflow: ${getComputedStyle(de).overflowX}/${getComputedStyle(de).overflowY}`,
        `images/s: ${fps}  déclencheurs GSAP: ${triggers.length} (épinglés: ${triggers.filter((t) => t.pin).length})`,
        `titres révélés: ${shown}/${reveals.length}`,
        `scènes: ${stickyState()}`,
        `sections: ${modes}`,
        `erreurs JS: ${errors.length ? "\n  " + errors.slice(-4).join("\n  ") : "aucune"}`,
      ].join("\n");
    };
    update();
    const timer = setInterval(update, 500);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
      el.remove();
    };
  }, []);

  return null;
}
