import { who } from "@/content/fr";
import ScrollFillText from "@/components/ui/ScrollFillText";
import RevealText from "@/components/ui/RevealText";

/**
 * 02 — QUI SOMMES-NOUS (suite de l'Énoncé). Bloc 1 du brief : humain, pas corporate ;
 * un média qui va vers les gens, qui écoute, qui observe et qui raconte.
 *
 * Mise en page éditoriale asymétrique (texte dans les 2/3 de droite), une idée par ligne :
 * la définition → ceux qu'on rencontre → notre rôle → le triptyque en majuscules.
 * Tous les textes viennent de fr.js (`who`), tels que dans le brief.
 */
export default function Presentation() {
  const gridCls = "grid gap-8 lg:grid-cols-[1fr_2.2fr]";

  return (
    <section
      id={who.id}
      aria-labelledby="qui-title"
      className="atmo-warm px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[110rem]">
        <h2 id="qui-title" className="sr-only">
          {who.label}
        </h2>

        <div className={`${gridCls} mt-[var(--space-block)]`}>
          <div aria-hidden="true" className="hidden lg:block" />
          <ScrollFillText
            cine
            lines={[who.definition]}
            wordClassName="text-silver"
            className="max-w-[34ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
          />
        </div>

        <div className={`${gridCls} mt-[var(--space-block)]`}>
          <div aria-hidden="true" className="hidden lg:block" />
          <RevealText cine as="p" className="max-w-[46ch] text-[length:var(--text-lead)] leading-relaxed text-ivory-dim">
            {who.meeting}
          </RevealText>
        </div>

        <div className={`${gridCls} mt-[var(--space-block)]`}>
          <div aria-hidden="true" className="hidden lg:block" />
          <ScrollFillText
            cine
            lines={[who.role]}
            wordClassName="text-silver"
            emClassName="text-accent"
            className="max-w-[26ch] font-sans text-[length:var(--text-title)] font-normal leading-[1.15] tracking-[-0.05em] text-ivory"
          />
        </div>

        {/* Le triptyque (en majuscules, comme dans le brief) : les mots se remplissent d'une ligne à l'autre. */}
        <ScrollFillText
          cine
          cineStagger={0.1}
          cineBlur={10}
          lines={who.triad}
          wordClassName="text-silver"
          emClassName="text-accent"
          className="mt-[var(--space-section)] font-sans text-[length:var(--text-headline)] font-normal uppercase leading-[1.1] tracking-[-0.04em] text-ivory"
        />
      </div>
    </section>
  );
}
