"use client";

import { useEffect, useRef } from "react";
import styles from "./origin.module.css";

/**
 * Vidéo d'ambiance de l'écran d'Origin : salle de projection, faisceau ambre → rouge → ambre, boucle sans raccord de 6 s.
 * - Fichiers : /media/video/origin-loop.{mp4,webm} (≈ 0,3 Mo) + poster /media/images/origin-poster.webp.
 *   Source d'origine : origin-screen-loop.mp4 (2560×1440, 8 s) ; boucle refaite avec ffmpeg (fondu de raccord).
 * - Ne se lance QUE si c'est raisonnable : pas en « réduire les animations », pas en économie de données.
 *   Dans ces cas, l'image fixe (poster) reste affichée et la vidéo n'est jamais téléchargée (preload="none").
 *   Elle joue AUSSI sur mobile (2026-09-25, demande : mêmes animations que le bureau) : 0,3 Mo, muette, playsInline.
 * - Joue seulement quand la section est visible, se met en pause quand on la quitte (batterie).
 */
export default function OriginVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData === true;
    if (reduce || saveData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = "auto";
          video.play().catch(() => {}); // autoplay refusé : le poster reste, rien de cassé
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        className={styles.video}
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        x-webkit-airplay="deny"
        preload="none"
        poster="/media/images/origin-poster.webp"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/media/video/origin-loop.webm" type="video/webm" />
        <source src="/media/video/origin-loop.mp4" type="video/mp4" />
      </video>
      {/* Voile : garde le centre sombre et calme pour que le mot ORIGIN reste parfaitement lisible. */}
      <div className={styles.videoVeil} aria-hidden="true" />
    </>
  );
}
