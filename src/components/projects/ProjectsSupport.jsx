import { projectsPage as copy } from "@/content/fr";
import { settings } from "@/lib/server/config";
import CTAButton from "@/components/ui/CTAButton";
import InvestForm from "./InvestForm";
import NewsletterForm from "./NewsletterForm";
import PartnerCTA from "./PartnerCTA";
import styles from "./projects.module.css";

/**
 * « Nous soutenir » — bloc unique de fin de page (brief revu le 2026-10-20, remplace les deux blocs séparés
 * Origin/PTH du 2026-10-19 : « c'est soit on soutient Origin, soit on soutient PTH » n'est plus la logique —
 * un seul don général PTH, plus trois autres manières d'agir). Quatre sous-blocs : don (grande carte, référence
 * Quantic déjà établie), partenariat, bénévolat (renvoie vers le formulaire bénévole de l'accueil — pas de
 * nouveau formulaire), suivi des projets (newsletter, réactivée).
 */
export default function ProjectsSupport() {
  const s = copy.support;
  const { contactEmail, calendarUrl } = settings().projects;

  return (
    <section id={s.id} aria-labelledby="projects-support-title" className="bg-ink px-[var(--space-gutter)] py-[var(--space-section)]">
      <div className="mx-auto max-w-[110rem]">
        <div data-reveal className="mx-auto max-w-[56rem] text-center">
          <h2 id="projects-support-title" className="font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver">
            {s.title}
          </h2>
          <div className="mx-auto mt-6 flex max-w-[60ch] flex-col gap-3">
            {s.text.map((p) => (
              <p key={p} className="text-[length:var(--text-lead)] leading-relaxed text-ivory-dim">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Soutenir financièrement — bloc à part, le plus engageant (référence Quantic). */}
        <div className="mt-[var(--space-block)] grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <div data-reveal>
            <h3 className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{s.finance.title}</h3>
          </div>
          <div data-reveal="fade" className={styles.supportCard}>
            <InvestForm />
          </div>
        </div>

        {/* Partenariat / Bénévolat / Suivre — trois manières plus légères, même rang. Même rayon que les
            cartes du catalogue et d'ORIGIN (refonte 2026-10-21) : un seul vocabulaire de carte sur toute la page. */}
        <div className="mt-[var(--space-block)] grid gap-6 lg:grid-cols-3">
          <div data-reveal className="flex flex-col gap-5 rounded-[calc(var(--radius-card)*1.3)] border border-ivory/16 bg-ink-soft/50 p-7">
            <div>
              <h3 className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{s.partner.title}</h3>
              <p className="mt-2 text-ivory-dim">{s.partner.text}</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <PartnerCTA contactEmail={contactEmail} calendarUrl={calendarUrl} ctaPrimary={s.partner.ctaPrimary} ctaSecondary={s.partner.ctaSecondary} />
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-5 rounded-[calc(var(--radius-card)*1.3)] border border-ivory/16 bg-ink-soft/50 p-7">
            <div>
              <h3 className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{s.volunteer.title}</h3>
              <p className="mt-2 text-ivory-dim">{s.volunteer.text}</p>
            </div>
            <div className="mt-auto">
              <CTAButton href="/#participer" mode="volunteer" variant="solid">
                {s.volunteer.cta}
              </CTAButton>
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-5 rounded-[calc(var(--radius-card)*1.3)] border border-ivory/16 bg-ink-soft/50 p-7">
            <div>
              <h3 className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{s.follow.title}</h3>
              <p className="mt-2 text-ivory-dim">{s.follow.text}</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
