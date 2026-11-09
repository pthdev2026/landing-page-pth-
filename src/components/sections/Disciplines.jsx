import { mission } from "@/content/fr";
import RevealText from "@/components/ui/RevealText";

/**
 * Les cinq langages (Cinéma, Journalisme, Éditorial, Digital, Création) + phrase de clôture. Sortis de « Notre
 * mission » le 2026-11-02 (demande utilisateur) pour venir juste après l'Énoncé (« Nous racontons des histoires… »).
 * Les textes restent dans `mission` (fr.js).
 */
export default function Disciplines() {
  return (
    <section aria-label="Nos cinq langages" className="atmo-red-band px-[var(--space-gutter)] py-[var(--space-section)]">
      <div className="mx-auto max-w-[110rem]">
        <ul className="grid border-t border-ivory/15 sm:grid-cols-2 lg:grid-cols-5">
          {mission.disciplines.map((word) => (
            <li key={word} data-focus className="border-b border-ivory/15 py-6 lg:border-b-0 lg:py-8">
              <span className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-silver">{word}</span>
            </li>
          ))}
        </ul>
        <div className="mt-[var(--space-block)] grid gap-6 lg:grid-cols-[1fr_2.2fr]">
          <div aria-hidden="true" className="hidden lg:block" />
          <RevealText cine as="p" className="max-w-[42ch] text-[length:var(--text-lead)] leading-relaxed text-ivory">
            {mission.closing}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
