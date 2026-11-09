import Link from "next/link";
import { projectsPage as copy } from "@/content/fr";
import OriginVideo from "@/components/origin/OriginVideo";
import OriginDimensions from "./OriginDimensions";
import styles from "./projects.module.css";

/**
 * ORIGIN, projet phare (brief §6) — réutilise la direction visuelle validée d'ORIGIN (écran 16:9, wordmark,
 * vidéo d'ambiance `OriginVideo.jsx`) mais en statique : pas le pin/scrub de la scène d'accueil, un bloc qui
 * se contente d'entrer (fondu + échelle légère, ≤ 1.03) sans retenir le scroll. Texte toujours prioritaire.
 * Les trois dimensions (Raconter/Rassembler/Redistribuer) vivent dans `OriginDimensions.jsx`, en pleine largeur
 * sous l'écran — un scroll horizontal a besoin de place, pas d'une colonne à moitié de la page (demande du
 * 2026-10-18).
 *
 * La grille « ambiance » (8 photos) posée ici le 2026-10-21 a été déplacée vers l'accueil (section « Pourquoi
 * maintenant », `WhyNow.jsx`) le même jour : c'est là, pas ici, qu'il manquait de vrais visuels.
 */
export default function ProjectsOrigin() {
  const o = copy.origin;
  return (
    <section id={o.id} aria-labelledby="projects-origin-title" className="bg-ink px-[var(--space-gutter)] py-[var(--space-section)]">
      <div className="mx-auto max-w-[110rem]">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div data-reveal className={styles.originScreen}>
            <OriginVideo />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={styles.originWordmark}>{o.title}</p>
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-6">
            <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{o.overline}</p>
            <p className="max-w-[26ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.2] tracking-[-0.05em] text-silver">
              {o.tagline}
            </p>

            <div className="flex max-w-[52ch] flex-col gap-3">
              {o.text.map((p) => (
                <p key={p} className="text-[length:var(--text-body)] leading-relaxed text-ivory-dim">
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-2 max-w-[52ch] text-[length:var(--text-small)] text-ivory-dim/80">{o.disclaimer}</p>

            {/* Sur une seule ligne même à 375 px (demande du 2026-10-21) : padding/gap resserrés sur mobile,
                grandeur normale à partir de sm. `shrink-0 whitespace-nowrap` : jamais le texte d'un bouton
                qui retombe sur 2 lignes (même piège constaté sur les montants de don). */}
            <div className="mt-2 flex flex-nowrap gap-2 sm:gap-3">
              <Link
                href="#soutenir"
                className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full bg-ivory px-4 font-sans text-[length:var(--text-small)] font-medium text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-white sm:px-7"
              >
                {o.ctaPrimary}
              </Link>
              <Link
                href="/projets/origin"
                className="inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full border border-ivory/25 bg-ink/45 px-4 font-sans text-[length:var(--text-small)] font-medium text-ivory transition-colors hover:border-ivory/55 hover:bg-ink/65 sm:px-7"
              >
                {o.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        <div data-reveal>
          <OriginDimensions dimensions={o.dimensions} />
        </div>
      </div>
    </section>
  );
}
