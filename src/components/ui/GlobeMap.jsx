"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import styles from "./globe.module.css";

// Turbopack ne sert pas correctement le Worker que maplibre-gl essaie de charger automatiquement (échec silencieux :
// la carte reste noire). On lui donne une copie statique du worker à la place — voir `public/vendor/maplibre-gl-worker.js`
// (copié de `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs` ; à recopier si `maplibre-gl` est mis à jour).
setWorkerUrl("/vendor/maplibre-gl-worker.js");

// Fond de carte libre, sans clé/compte (CARTO Dark Matter — © CARTO, © OpenStreetMap contributors, attribution conservée).
const STYLE_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// À zoom z, le tour du monde mesure 512 × 2^z px (base tuile) ; le diamètre du globe ≈ ce tour / π.
// On inverse la formule pour trouver le zoom qui fait tenir un diamètre donné.
const zoomForDiameter = (diameterPx) => Math.log2((diameterPx * Math.PI) / 512);

/**
 * La carte elle-même (maplibre-gl, ~800 Ko) : chargée UNIQUEMENT par Globe.jsx, à l'approche de l'écran
 * (voir le `import()` dynamique là-bas) — jamais dans le paquet JS initial de la page.
 * Toujours `interactive: false` : un globe qu'on peut glisser au doigt volerait le défilement vertical sur mobile
 * (scroll hijacking, interdit) ; l'immersion vient ici de la rotation lente, pas de la manipulation.
 * Pas de pastilles-photo (retirées à la demande de l'utilisateur, 2026-09-27) : juste la carte, étalonnée dans
 * notre DA (voir `.tint` dans globe.module.css).
 */
export default function GlobeMap({ mobile }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Zoom calculé pour que le globe REMPLISSE le bloc (retour utilisateur : « ça fait une petite planète dans
    // une case » puis « un globe qui prend tout le block ») : diamètre cadré sur la PLUS GRANDE dimension du cadre
    // (comme `object-fit: cover`, pas `contain` — sinon un cadre large-écran laisse deux bandes noires de chaque
    // côté), avec un léger débord ; le surplus est coupé par `overflow: hidden` sur `.wrap`. Recalculé au redimensionnement.
    const fitGlobe = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      map.setZoom(Math.max(0.15, zoomForDiameter(Math.max(w, h) * 1.05)));
    };

    const map = new MapLibreMap({
      container,
      style: STYLE_URL,
      center: [12, 48], // Europe au centre au repos (PTH est francophone/européen) — la rotation s'en écarte lentement puis y revient
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 4,
      interactive: false, // décoratif, aria-hidden : jamais de manipulation qui puisse piéger le scroll
      attributionControl: { compact: true },
      // Perf mobile : sur un cadre quasi plein écran, un rendu WebGL au plein `devicePixelRatio` (3 sur la plupart
      // des téléphones) redessine des millions de pixels à chaque image pendant la rotation. Plafonné à 1.5/2 —
      // toujours net, beaucoup moins coûteux (batterie/fluidité).
      pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
    });

    map.on("load", () => {
      map.setProjection({ type: "globe" });
      // Gris neutre (pas de teinte rouge) : décision utilisateur, un globe gris/argenté, cohérent avec les
      // titres argentés du site. `horizon-color` plus clair : une lueur douce autour du globe (référence utilisateur
      // — un globe qui « brille » dans le noir), toujours en gris/blanc, jamais bleu.
      map.setSky({
        "sky-color": "#0a0a0a",
        "sky-horizon-blend": 0.5,
        "horizon-color": "#3a3a3a",
        "horizon-fog-blend": 0.65,
        "fog-color": "#050505",
        "fog-ground-blend": 0.7,
        "atmosphere-blend": 0.8,
      });
      fitGlobe();
    });

    const ro = new ResizeObserver(fitGlobe);
    ro.observe(container);

    // Rotation lente et continue (le globe « vit », sans qu'on ait besoin d'y toucher) — mais UNIQUEMENT tant que le
    // globe est réellement à l'écran : une fois qu'on a défilé plus bas (Ambition, Origin, Formats…), continuer à
    // redessiner un canvas WebGL invisible ne sert à rien et coûte batterie/fluidité pour rien. On coupe la rotation
    // hors champ et on la reprend au retour (`IntersectionObserver`, pas de re-création de la carte).
    let timer = null;
    const spin = () => {
      const c = map.getCenter();
      map.jumpTo({ center: [c.lng + 0.09, c.lat] });
    };
    const io = !reduceMotion
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !timer) timer = setInterval(spin, 45);
            else if (!entry.isIntersecting && timer) {
              clearInterval(timer);
              timer = null;
            }
          },
          { threshold: 0.01 },
        )
      : null;
    io?.observe(container);

    return () => {
      if (timer) clearInterval(timer);
      io?.disconnect();
      ro.disconnect();
      map.remove();
    };
  }, [mobile]);

  return <div ref={containerRef} className={styles.map} />;
}
