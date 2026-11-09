"use client";

import { usePathname } from "next/navigation";
import { footer, nav, site } from "@/content/fr";
import Logo from "@/components/ui/Logo";
import { selectMode } from "@/lib/forms/events";

/**
 * Pied de page = le générique de fin. Sobre : la vision, la navigation, les réseaux (seulement ceux dont l'adresse
 * est renseignée), les mentions légales — et, en bas, un immense logo très estompé, rogné (repris de la référence Saki).
 * Le grand logo est décoratif (aria-hidden).
 */
export default function Footer() {
  const socials = footer.socials.filter((s) => s.href);
  // Même règle que Header.jsx : une ancre (#origin, #soutenir, #contact…) ne veut dire quelque chose que sur
  // l'accueil, ses sections. Ailleurs (ex. /projets, qui a ses propres #origin/#soutenir), il faut d'abord y
  // ramener avant de défiler — sinon on défile dans la page courante vers une ancre homonyme, ou vers rien.
  const onHome = usePathname() === "/";
  const toHome = (href) => (href.startsWith("#") && !onHome ? `/${href}` : href);

  return (
    <footer className="relative overflow-hidden bg-ink px-[var(--space-gutter)] pt-[var(--space-block)]">
      <div className="mx-auto grid max-w-[110rem] gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
        <p data-reveal className="max-w-sm font-sans text-[length:var(--text-lead)] leading-snug text-ivory-dim">{footer.tagline}</p>

        <nav data-reveal="fade" aria-label="Navigation du pied de page">
          <ul className="space-y-3 font-sans text-[length:var(--text-small)] font-medium">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a href={toHome(link.href)} className="text-ivory transition-colors hover:text-ivory-dim">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={toHome(nav.actions[0].href)}
                onClick={() => selectMode(nav.actions[0].mode)}
                className="text-ivory transition-colors hover:text-ivory-dim"
              >
                {nav.actions[0].label}
              </a>
            </li>
            <li>
              <a href={toHome("#contact")} className="text-ivory transition-colors hover:text-ivory-dim">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {socials.length > 0 ? (
          <ul data-reveal="fade" aria-label="Réseaux" className="space-y-3 font-sans text-[length:var(--text-small)] font-medium">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="text-ivory transition-colors hover:text-ivory-dim" rel="noopener noreferrer" target="_blank">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div data-reveal="fade" className="mx-auto mt-[var(--space-block)] flex max-w-[110rem] flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-6 text-[length:var(--text-small)] text-ivory-dim">
        <p>
          © {new Date().getFullYear()} {site.fullName}
        </p>
        <ul className="flex gap-6">
          {footer.legal.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-ivory">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Grand logo décoratif : très estompé, rogné en bas. */}
      <div data-reveal="fade" aria-hidden="true" className="pointer-events-none mx-auto mt-[var(--space-sub)] max-w-[110rem] translate-y-[16%] select-none">
        <Logo className="w-full opacity-[0.09] [mask-image:linear-gradient(to_bottom,black_20%,transparent_92%)]" />
      </div>
    </footer>
  );
}
