import { mission } from "@/content/fr";
import Accent from "@/components/ui/Accent";
import ScrollFillText from "@/components/ui/ScrollFillText";
import RevealText from "@/components/ui/RevealText";
import MediaFrame from "@/components/ui/MediaFrame";

/**
 * 03 — NOTRE MISSION. Bloc 2 du brief : pourquoi PTH existe ; la dimension chrétienne est explicite.
 * Une idée par temps : la phrase-mission → la conviction (avec un portrait) → (les cinq langages et la clôture vivent désormais dans `Disciplines.jsx`, juste après l'Énoncé).
 * Tous les textes viennent de fr.js (`mission`), tels que dans le brief.
 */
export default function Mission() {
  return (
    <section id={mission.id} aria-labelledby="mission-title" className="bg-ink">
      {/* La phrase-mission */}
      <div className="mx-auto max-w-[110rem] px-[var(--space-gutter)] pt-[var(--space-section)]">
        <h2
          id="mission-title"
          data-reveal
          className="max-w-[18ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
        >
          <Accent text={mission.statement} />
        </h2>
      </div>

      {/* La conviction, avec un portrait (visuel à fournir) */}
      <div className="mx-auto grid max-w-[110rem] items-center gap-12 px-[var(--space-gutter)] py-[var(--space-section)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <MediaFrame
          src={mission.media.src ?? undefined}
          alt={mission.media.alt}
          label={mission.media.label}
          aspect="aspect-[4/5]"
          className="max-w-md lg:max-w-none"
        />
        <div>
          <ScrollFillText
            cine
            lines={[mission.belief]}
            wordClassName="text-silver"
            className="max-w-[24ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
          />
          <RevealText cine as="p" className="mt-10 max-w-[30ch] text-[length:var(--text-lead)] leading-snug text-ivory-dim">
            {mission.language}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
