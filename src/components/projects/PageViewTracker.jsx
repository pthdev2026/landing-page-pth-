"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Évènement de vue de page (`projects_page_view`, `origin_view`…) — un composant minuscule, pour pouvoir
 * l'appeler depuis des pages serveur sans transformer toute la page en composant client. */
export default function PageViewTracker({ event, props }) {
  useEffect(() => {
    track(event, props || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
