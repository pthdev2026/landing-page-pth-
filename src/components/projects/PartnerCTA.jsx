"use client";

import { track } from "@/lib/analytics";

/** Boutons « Devenir partenaire » — composant client séparé de `ProjectsSupport.jsx` (server) juste pour
 * pouvoir suivre les clics (`partner_contact_click`, `calendar_click`) ; les coordonnées restent lues côté
 * serveur et arrivent ici en props, jamais devinées ni codées en dur. */
export default function PartnerCTA({ contactEmail, calendarUrl, ctaPrimary, ctaSecondary }) {
  if (!contactEmail && !calendarUrl) {
    return <p className="text-[length:var(--text-small)] text-ivory-dim/70">Coordonnées à venir.</p>;
  }
  return (
    <>
      {contactEmail ? (
        <a
          href={`mailto:${contactEmail}`}
          onClick={() => track("partner_contact_click", {})}
          className="inline-flex min-h-12 items-center rounded-full bg-ivory px-7 font-sans text-[length:var(--text-small)] font-medium text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:bg-white"
        >
          {ctaPrimary}
        </a>
      ) : null}
      {calendarUrl ? (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("calendar_click", {})}
          className="inline-flex min-h-12 items-center rounded-full border border-ivory/25 bg-ink/45 px-7 font-sans text-[length:var(--text-small)] font-medium text-ivory transition-colors hover:border-ivory/55 hover:bg-ink/65"
        >
          {ctaSecondary}
        </a>
      ) : null}
    </>
  );
}
