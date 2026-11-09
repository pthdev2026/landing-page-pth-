"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/fr";
import CTAButton from "@/components/ui/CTAButton";
import Logo from "@/components/ui/Logo";

/**
 * Menu flottant (référence Saki) : le bandeau pleine largeur disparaît, il ne reste que trois éléments
 * qui flottent au-dessus de la page :
 *   1. le logo — toujours nu, sans cercle ni pastille ;
 *   2. la capsule centrale — les liens ; celui de la section en cours est mis en avant ;
 *   3. la pastille d'action à droite (desktop) — « Être bénévole ».
 * Mobile : logo + pastille « Menu » qui déplie une carte arrondie.
 *
 * Le `<header>` couvre toute la largeur mais ne capte aucun clic (`pointer-events-none`) : seuls les trois
 * éléments flottants les reçoivent (`pointer-events-auto`), pour ne jamais bloquer le contenu dessous.
 * `data-site-header` : repère utilisé par la timeline de la Hero pour l'afficher en fin d'intro.
 */

/**
 * Identifiant de la section en cours : celle qui traverse la ligne située à 45 % de la hauteur d'écran.
 * IntersectionObserver plutôt qu'un écouteur de scroll : pas de mesure de mise en page à chaque défilement.
 */
function useCurrentSection() {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const sections = [...document.querySelectorAll("main > section[id]")];
    const crossing = new Set();
    // La zone d'observation est une bande d'1 px à 45 % de la hauteur : une section « croise » la ligne quand elle la couvre.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        // Fin de page (membre, contact, fin) : aucun lien n'est actif, le pied de page prend le relais.
        setCurrent(sections.map((s) => s.id).findLast((id) => crossing.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -54.9% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return current;
}

/**
 * Le logo est « nu » (pas de pastille derrière) : sur les bandes claires (Promesse, blocs ivoire de /projets),
 * sa version blanche devient illisible malgré l'ombre portée (bug constaté le 2026-10-19, à 375 px). On détecte
 * ces bandes via `[data-light-section]` et on bascule le logo en sombre (inversion) seulement quand l'une d'elles
 * passe sous le bandeau du haut. Le reste du header (pastilles opaques, bouton plein) reste lisible dans les deux cas.
 */
function useOnLight() {
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    const sections = [...document.querySelectorAll("[data-light-section]")];
    if (!sections.length) return;
    const crossing = new Set();
    // Bande d'observation = le haut de l'écran (hauteur du header) : on ne regarde pas si la section est
    // visible dans toute la page, seulement si elle couvre la zone où flotte le logo.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target);
          else crossing.delete(entry.target);
        }
        setOnLight(crossing.size > 0);
      },
      { rootMargin: "0px 0px -90% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return onLight;
}

/**
 * Barre d'avancement « film » : un fil rouge de 2 px en haut de l'écran qui suit la lecture de la page.
 * Aucun état React : on écrit directement le `transform` (un seul calque, coût nul), à chaque défilement.
 */
function useReadingProgress(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const progressRef = useRef(null);
  useReadingProgress(progressRef);
  const currentSection = useCurrentSection();
  const onLight = useOnLight();
  const pathname = usePathname();
  // Les ids de section de l'accueil (ex. « origin », « soutenir ») ne veulent dire qu'une seule chose : les
  // sections DE l'accueil. Ailleurs (ex. /projets, qui a ses propres #origin/#soutenir), seul le chemin compte —
  // sinon « Origin »/« Nous soutenir » s'allumeraient à tort en scrollant une autre page qui réutilise ces ids.
  const onHome = pathname === "/";
  const activeHref = onHome
    ? nav.links.find((l) => l.sections.includes(currentSection))?.href
    : nav.links.find((l) => l.href.startsWith("/") && pathname.startsWith(l.href))?.href;
  // Les ancres (#origin, #soutenir, #participer…) ne veulent dire quelque chose que sur l'accueil : ses sections.
  // Ailleurs (ex. /projets, qui a ses propres #origin/#soutenir), cliquer dessus doit RAMENER à l'accueil puis
  // défiler, pas défiler dans la page courante vers une ancre homonyme — ou, pire, vers rien du tout (#participer
  // n'existe nulle part hors accueil). Les liens vers une autre page (ex. « Nos projets », `/projets`) sont inchangés.
  const toHome = (href) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const floating = "pointer-events-auto border border-ivory/10 bg-ink-line/95";

  return (
    <header data-site-header className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-header)]">
      <div
        ref={progressRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-signal/80 will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
      <div className="mx-auto flex max-w-[110rem] items-start justify-between px-[var(--space-gutter)] pt-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:pt-5">
        {/* 1 — Logo : toujours nu (sans cercle ni pastille), partout. Une ombre douce le garde lisible sur le contenu.
            Plus petit sur mobile (référence envoyée le 2026-10-21, grof.io : un logo discret en haut à gauche —
            le nôtre était trop grand à 375 px). */}
        <a href={toHome("#top")} aria-label={`${site.name} — retour en haut`} className="pointer-events-auto inline-flex h-11 items-center justify-self-start">
          <Logo
            className={`w-14 transition-[filter] duration-300 motion-reduce:transition-none lg:w-[4.75rem] ${
              onLight
                ? "[filter:invert(1)_drop-shadow(0_2px_10px_rgba(0,0,0,0.22))]"
                : "[filter:drop-shadow(0_2px_14px_rgba(0,0,0,0.7))]"
            }`}
          />
        </a>

        {/* 2 — Capsule centrale (desktop). */}
        <nav aria-label="Navigation principale" className={`${floating} hidden rounded-full p-1 lg:block`}>
          <ul className="flex items-center gap-0.5">
            {nav.links.map((link) => {
              const active = link.href === activeHref;
              return (
                <li key={link.href}>
                  <a
                    href={toHome(link.href)}
                    aria-current={active ? "true" : undefined}
                    className={`block rounded-full px-4 py-2 text-[length:var(--text-small)] font-medium leading-none transition-colors duration-300 motion-reduce:transition-none ${
                      active ? "bg-ivory/12 text-ivory" : "text-ivory/65 hover:text-ivory"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 3 — Pastille d'action (bureau) / mobile : juste le burger (2026-10-21 : le bouton rond « Nous
            rejoindre » à sa droite est retiré — redondant avec le lien déjà présent dans le menu déplié). */}
        <div className="pointer-events-none flex items-center justify-end gap-2 lg:justify-self-end">
          <CTAButton
            href={toHome(nav.actions[0].href)}
            mode={nav.actions[0].mode}
            variant="solid"
            className="pointer-events-auto !min-h-11 !px-5 max-lg:hidden"
          >
            {nav.actions[0].label}
          </CTAButton>

          {/* Burger (référence grof.io du 2026-10-21, mobile seulement) : remplace la pastille texte « Menu » +
              chevron — deux traits qui pivotent en croix à l'ouverture. */}
          <button
            type="button"
            className={`${floating} inline-flex h-11 w-11 items-center justify-center rounded-full text-ivory lg:hidden`}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative flex h-3 w-4 flex-col justify-between">
              <span
                className={`block h-px w-full bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "translate-y-[5.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-full bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "-translate-y-[5.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="pointer-events-auto mx-[var(--space-gutter)] mt-3 lg:hidden">
          <div
            id="menu-mobile"
            className="rounded-[var(--radius-card)] border border-ivory/10 bg-ink-line p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <ul className="flex flex-col gap-4 font-sans text-3xl font-normal tracking-[-0.05em]">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={toHome(link.href)}
                    aria-current={link.href === activeHref ? "true" : undefined}
                    className={link.href === activeHref ? "text-ivory" : "text-ivory/70"}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3">
              {nav.actions.map((action) => (
                <CTAButton
                  key={action.label}
                  href={toHome(action.href)}
                  mode={action.mode}
                  variant={action.variant}
                  onClick={() => setOpen(false)}
                >
                  {action.label}
                </CTAButton>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
