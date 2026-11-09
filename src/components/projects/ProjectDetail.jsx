import Image from "next/image";
import Link from "next/link";
import { projectsPage as copy } from "@/content/fr";
import { projectStatusLabels } from "@/content/projects";
import { settings } from "@/lib/server/config";
import InvestForm from "./InvestForm";
import NewsletterForm from "./NewsletterForm";
import PartnerCTA from "./PartnerCTA";
import PageViewTracker from "./PageViewTracker";

/**
 * Fiche projet (brief §8) — URL dédiée et partageable (`/projets/[slug]`), pas une modale. N'affiche QUE les
 * champs réellement renseignés dans `src/content/projects.js` (objectifs, besoins de financement) : pas de
 * section « actualités » ou « prochaines étapes » tant qu'aucun contenu réel n'existe pour ces champs — masqué
 * proprement plutôt qu'inventé (brief §15).
 */
export default function ProjectDetail({ project }) {
  const p = copy.project;
  const { contactEmail, calendarUrl } = settings().projects;

  return (
    <>
      <PageViewTracker event={project.slug === "origin" ? "origin_view" : "project_open"} props={{ slug: project.slug }} />

      <section className="bg-ink px-[var(--space-gutter)] pb-[var(--space-block)] pt-32 lg:pt-40">
        <div className="mx-auto max-w-[72rem]">
          <Link href="/projets" className="font-sans text-[length:var(--text-small)] font-medium text-champagne hover:text-ivory">
            {p.back}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-ivory/16">
              <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
            </div>
            <div data-reveal>
              <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">
                {project.category} · {projectStatusLabels[project.status]}
              </p>
              <h1 className="mt-4 font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver">
                {project.title}
              </h1>
              <p className="mt-6 max-w-[56ch] text-[length:var(--text-lead)] leading-relaxed text-ivory-dim">{project.fullDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {project.objectives?.length ? (
        <section className="bg-ink px-[var(--space-gutter)] pb-[var(--space-block)]">
          <div className="mx-auto max-w-[72rem]">
            <h2 data-reveal className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-silver">
              {p.objectivesTitle}
            </h2>
            <ul data-reveal className="mt-6 flex flex-col gap-4">
              {project.objectives.map((o) => (
                <li key={o} className="flex gap-3 border-t border-ivory/14 pt-4 text-ivory-dim">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {project.fundingNeeds?.length ? (
        <section className="bg-ink px-[var(--space-gutter)] pb-[var(--space-section)]">
          <div className="mx-auto max-w-[72rem]">
            <h2 data-reveal className="font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-silver">
              {p.fundingTitle}
            </h2>
            <ul data-reveal className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.fundingNeeds.map((f) => (
                <li key={f} className="rounded-[var(--radius-card)] border border-ivory/14 bg-ink-soft/50 p-5 text-ivory-dim">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="soutenir" className="bg-ink-soft px-[var(--space-gutter)] py-[var(--space-section)]">
        <div className="mx-auto grid max-w-[72rem] gap-10 lg:grid-cols-2">
          {project.donationEnabled ? (
            <div data-reveal className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-ivory/16 bg-ink/60 p-6 lg:p-8">
              <div>
                <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{p.donate}</p>
                <h3 className="mt-3 font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{project.title}</h3>
              </div>
              <InvestForm project={{ slug: project.slug, title: project.title }} />
            </div>
          ) : null}

          <div className="flex flex-col gap-10">
            {project.newsletterEnabled ? (
              <div data-reveal className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-ivory/16 bg-ink/60 p-6 lg:p-8">
                <div>
                  <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{copy.support.follow.kicker}</p>
                  <h3 className="mt-3 font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{copy.support.follow.title}</h3>
                  <p className="mt-2 text-ivory-dim">{copy.support.follow.text}</p>
                </div>
                <NewsletterForm />
              </div>
            ) : null}

            {project.contactEnabled && (contactEmail || calendarUrl) ? (
              <div data-reveal className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-ivory/16 bg-ink/60 p-6 lg:p-8">
                <div>
                  <p className="font-sans text-[length:var(--text-micro)] uppercase tracking-[0.24em] text-champagne">{copy.support.partner.kicker}</p>
                  <h3 className="mt-3 font-sans text-[length:var(--text-title)] font-normal tracking-[-0.05em] text-ivory">{copy.support.partner.title}</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PartnerCTA contactEmail={contactEmail} calendarUrl={calendarUrl} ctaPrimary={copy.support.partner.ctaPrimary} ctaSecondary={copy.support.partner.ctaSecondary} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
