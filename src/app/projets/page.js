import { projectsPage } from "@/content/fr";
import { site } from "@/content/fr";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsWhy from "@/components/projects/ProjectsWhy";
import ProjectsOrigin from "@/components/projects/ProjectsOrigin";
import ProjectsCatalog from "@/components/projects/ProjectsCatalog";
import ProjectsSupport from "@/components/projects/ProjectsSupport";
import ProjectsClosing from "@/components/projects/ProjectsClosing";
import SecondaryNav from "@/components/projects/SecondaryNav";
import PageViewTracker from "@/components/projects/PageViewTracker";

export const metadata = {
  title: projectsPage.meta.title,
  description: projectsPage.meta.description,
  openGraph: {
    title: projectsPage.meta.title,
    description: projectsPage.meta.description,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: projectsPage.meta.title,
  description: projectsPage.meta.description,
  isPartOf: { "@type": "WebSite", name: site.fullName },
};

/**
 * /projets — « Nos projets » (brief revu le 2026-10-20). Hero → Pourquoi → ORIGIN (projet phare) → Catalogue
 * → Nous soutenir (un seul bloc, don PTH + partenariat + bénévolat + suivi des projets — remplace les deux
 * blocs de soutien séparés Origin/PTH du 2026-10-19) → phrase finale.
 */
export default function ProjetsPage() {
  return (
    <>
      <ProjectsHero />
      <SecondaryNav />
      <ProjectsWhy />
      <ProjectsOrigin />
      <ProjectsCatalog />
      <ProjectsSupport />
      <ProjectsClosing />
      <PageViewTracker event="projects_page_view" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
