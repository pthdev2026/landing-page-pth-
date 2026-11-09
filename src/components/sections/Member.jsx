import { member } from "@/content/fr";
import ScrollFillText from "@/components/ui/ScrollFillText";
import CTAButton from "@/components/ui/CTAButton";
import Star from "@/components/ui/Star";

/**
 * 13 — DEVENIR MEMBRE. Une carte de titre centrée (style affiche Nedra) : rejoindre PTH, c'est rejoindre une communauté.
 * Le sens concret de « membre » reste à définir (newsletter, communauté privée, accès anticipé, Discord, événements).
 * Textes du brief (§13) dans `member` de fr.js. Le bouton présélectionne le mode « membre » du formulaire (section Contact).
 */
export default function Member() {
  return (
    <section
      id={member.id}
      aria-labelledby="member-title"
      className="atmo-glow-top px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <div className="mx-auto flex max-w-[56rem] flex-col items-center text-center">
        <Star />
        <h2
          id="member-title"
          data-reveal
          className="mt-8 max-w-[22ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
        >
          {member.title}
        </h2>

        <ScrollFillText
          cine
          lines={[member.text]}
          wordClassName="text-silver"
          emClassName="text-accent"
          className="mt-8 max-w-[34ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.2] tracking-[-0.05em] text-ivory"
        />

        <CTAButton href="#participer" mode="member" variant="solid" arrow data-reveal="fade" className="mt-[var(--space-sub)]">
          {member.cta}
        </CTAButton>
      </div>
    </section>
  );
}
