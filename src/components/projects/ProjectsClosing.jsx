import { projectsPage as copy } from "@/content/fr";
import CTAButton from "@/components/ui/CTAButton";

/**
 * Phrase finale de /projets (brief du 2026-10-20) — dernier mot avant le pied de page, un seul CTA.
 */
export default function ProjectsClosing() {
  const c = copy.closing;
  return (
    <section aria-labelledby="projects-closing-title" className="bg-ink px-[var(--space-gutter)] py-[var(--space-section)]">
      <div data-reveal className="mx-auto flex max-w-[48rem] flex-col items-center gap-8 text-center">
        <h2 id="projects-closing-title" className="font-sans text-[length:var(--text-headline)] font-normal leading-[1.15] tracking-[-0.05em] text-silver">
          {c.title}
        </h2>
        <CTAButton href="#soutenir" variant="solid">
          {c.cta}
        </CTAButton>
      </div>
    </section>
  );
}
