import Link from "next/link";
import { projectsPage as copy } from "@/content/fr";
import styles from "./projects.module.css";

/**
 * Hero de /projets — fond riche inspiré d'une référence envoyée le 2026-10-19 (Tirtus, structure seulement :
 * jamais ses couleurs ni une photo — notre dégradé rouge/noir `atmo-red-band` + grain, déjà établis ailleurs
 * sur le site). Titre centré (demande explicite du 2026-10-19 : « il faudrait que Nos projets, ce soit au
 * milieu, c'est très important »). Sous-texte (2026-10-21) : une variante courte, tenue sur une ligne, de la
 * phrase d'ouverture du bloc « Pourquoi nous construisons » (« L'Évangile est gratuit. Le transmettre exige
 * des moyens. ») — écho voulu entre les deux, pas une répétition mot pour mot. `--text-monument` (prévu pour
 * un mot-décor hors-texte, cf. `.monument` dans base.css) était trop grand pour tenir « Nos projets » sur une
 * ligne, remplacé par une échelle dédiée qui tient dans le conteneur à toutes les largeurs testées
 * (375/390/430/1280/1440). L'entrée est portée par `data-reveal`.
 *
 * Mobile uniquement (référence envoyée le 2026-10-21, grof.io/prospection — structure reprise, jamais ses
 * couleurs) : titre en majuscules, bouton principal au texte défilant en boucle (voir `.marqueeTrack` dans
 * `projects.module.css`), avec la pastille ronde fixe (flèche) à gauche — l'utilisateur a renvoyé un gros plan
 * du bouton en précisant « le modèle » : pilule rouge identitaire (`--color-signal`, pas leur rouge à eux) +
 * pastille ivoire fixe, le texte qui défile dans le reste de la pilule. Le bureau garde le titre normal et un
 * bouton statique, sans pastille (inchangé).
 */
function HeroArrow() {
  return (
    <svg aria-hidden="true" width="16" height="11" viewBox="0 0 18 12" fill="none">
      <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export default function ProjectsHero() {
  return (
    <section
      aria-labelledby="projects-hero-title"
      className="atmo-red-band grain flex min-h-[85svh] items-center px-[var(--space-gutter)] pb-[var(--space-block)] pt-40"
    >
      <div className="mx-auto flex w-full max-w-[64rem] flex-col items-center text-center">
        <h1
          id="projects-hero-title"
          data-reveal
          className="whitespace-nowrap font-sans text-[length:clamp(2.5rem,9vw,7rem)] font-normal uppercase leading-[0.95] tracking-[-0.05em] text-silver lg:normal-case"
        >
          {copy.hero.title}
        </h1>
        <p data-reveal className="mt-6 whitespace-nowrap text-[length:var(--text-lead)] leading-relaxed text-ivory-dim">
          {copy.hero.subtitle}
        </p>
        <div data-reveal="fade" className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#soutenir"
            className="relative inline-flex h-12 w-60 items-center overflow-hidden rounded-full bg-signal pl-1 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-signal/90 lg:w-auto lg:justify-center lg:bg-ivory lg:px-7 lg:hover:bg-white"
          >
            <span className="sr-only">{copy.hero.ctaPrimary}</span>
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-ink lg:hidden">
              <HeroArrow />
            </span>
            <span aria-hidden="true" className={`${styles.marqueeTrack} font-sans text-[length:var(--text-small)] font-medium text-ivory`}>
              <span>{copy.hero.ctaPrimary}</span>
              <span>{copy.hero.ctaPrimary}</span>
            </span>
            <span aria-hidden="true" className="hidden font-sans text-[length:var(--text-small)] font-medium text-ink lg:inline">
              {copy.hero.ctaPrimary}
            </span>
          </Link>
          <Link
            href="#origin"
            className="inline-flex min-h-12 items-center rounded-full border border-ivory/25 bg-ink/45 px-7 font-sans text-[length:var(--text-small)] font-medium text-ivory transition-colors hover:border-ivory/55 hover:bg-ink/65"
          >
            {copy.hero.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
