"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projectsPage as copy } from "@/content/fr";
import { projects, projectStatusLabels } from "@/content/projects";
import { track } from "@/lib/analytics";
import styles from "./projects.module.css";

/**
 * Catalogue des projets (brief §7) — filtres par statut (Tous/En développement/Déjà réalisés/À venir),
 * accessibles au clavier (de vrais boutons `aria-pressed`, pas des onglets décoratifs). Chaque carte a sa
 * propre URL (`next/link`, jamais une modale sans URL) — `project_open` est suivi au clic.
 */
export default function ProjectsCatalog() {
  const [filter, setFilter] = useState("all");
  const c = copy.catalogue;
  const visible = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <section id={c.id} data-light-section aria-labelledby="projects-catalogue-title" className={`${styles.light} px-[var(--space-gutter)] py-[var(--space-section)]`}>
      <div className="mx-auto max-w-[110rem]">
        <div data-reveal className="flex flex-col gap-4">
          <h2 id="projects-catalogue-title" className="max-w-[20ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em]">
            {c.title}
          </h2>
          <p className={`max-w-[60ch] text-[length:var(--text-lead)] leading-relaxed ${styles.lightDim}`}>{c.intro}</p>
        </div>

        <div data-reveal role="group" aria-label="Filtrer les projets par statut" className={`${styles.filters} mt-10`}>
          {c.filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={styles.filterBtn}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          // Carte verticale (refonte 2026-10-21, référence grof.io : photo pleine largeur en haut, hiérarchie
          // label/titre/texte/action en dessous — structure reprise, jamais leurs couleurs). Pas de prix,
          // dates ni « clients » : ces métadonnées n'existent pas pour un projet PTH, jamais inventées.
          <ul data-reveal className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projets/${project.slug}`}
                  onClick={() => track("project_open", { slug: project.slug })}
                  className={`${styles.card} h-full`}
                >
                  <div className={styles.cardMedia}>
                    <span className={styles.cardStatus}>{projectStatusLabels[project.status]}</span>
                    <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className={styles.lightKicker}>{project.category}</p>
                    <h3 className="font-sans text-[length:var(--text-title)] font-normal leading-tight tracking-[-0.05em]">{project.title}</h3>
                    <p className={`text-[length:var(--text-body)] leading-relaxed ${styles.lightDim}`}>{project.shortDescription}</p>
                    <span className={`${styles.cardCta} mt-3`}>
                      {project.cta}
                      <svg aria-hidden="true" width="16" height="11" viewBox="0 0 18 12" fill="none">
                        <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p data-reveal className={`mt-10 ${styles.lightDim}`}>Aucun projet dans cette catégorie pour l’instant.</p>
        )}
      </div>
    </section>
  );
}
