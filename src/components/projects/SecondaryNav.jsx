"use client";

import { useEffect, useState } from "react";
import { projectsPage as copy } from "@/content/fr";
import styles from "./projects.module.css";

/**
 * Navigation secondaire sticky, après la Hero (brief §10) : Vision / ORIGIN / Projets / Soutenir.
 * Indique la section active (IntersectionObserver, même principe que Header.jsx), fonctionne au clavier
 * (de vrais liens), disparaît sur mobile en version simplifiée — ici, un défilement horizontal plutôt qu'un
 * empilement qui pousserait le contenu.
 */
export default function SecondaryNav() {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const ids = copy.nav.map((l) => l.href.replace("#", ""));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const crossing = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        setCurrent(ids.find((id) => crossing.has(id)) ?? null);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Navigation de la page" className={`${styles.secondaryNav} overflow-x-auto`}>
      {copy.nav.map((link) => {
        const active = link.href.replace("#", "") === current;
        return (
          <a key={link.href} href={link.href} aria-current={active ? "true" : undefined} className={styles.secondaryNavLink}>
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
