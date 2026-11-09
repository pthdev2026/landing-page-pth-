"use client";

import { useState, useSyncExternalStore } from "react";
import { heroTimelineRef, STORYBOARD } from "./heroTimeline";

const subscribe = () => () => {};
const getSnapshot = () => window.location.search.includes("debug");
const getServerSnapshot = () => false;

/**
 * Curseur de debug : ajouter `?debug` à l'URL. Il remplace le scroll et pose la timeline
 * sur n'importe quelle étape du storyboard. Permet de vérifier chaque image sans dépendre
 * du scroll, de la vitesse de l'ordinateur ou de l'état de l'onglet.
 */
export default function HeroDebug() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [value, setValue] = useState(0);
  if (!enabled) return null;

  const go = (p) => {
    setValue(p);
    heroTimelineRef.current?.progress(p).pause();
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-[min(92vw,34rem)] rounded bg-black/85 p-3 font-mono text-xs text-ivory">
      <label className="flex items-center gap-3">
        <span className="w-14 shrink-0">{value.toFixed(3)}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={value}
          onChange={(e) => go(Number(e.target.value))}
          className="w-full"
          aria-label="Progression de la timeline"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        {STORYBOARD.map((step) => (
          <button
            key={step.id}
            type="button"
            title={step.label}
            onClick={() => go(step.at)}
            className="border border-ivory/30 px-2 py-1 hover:border-champagne"
          >
            {step.id}
          </button>
        ))}
      </div>
    </div>
  );
}
