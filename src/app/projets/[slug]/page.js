import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/fr";
import ProjectDetail from "@/components/projects/ProjectDetail";

/** Modèle réutilisable (brief §2) : sert `/projets/origin`, `/projets/pth`, et tout projet ajouté ensuite au
 * catalogue (`src/content/projects.js`) — aucune page à dupliquer. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Next.js 16 : `params` est une Promise (API différente des versions précédentes — voir
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md), à `await` ici
// et dans `generateMetadata`.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} | ${site.fullName}`,
    description: project.shortDescription,
    openGraph: { title: project.title, description: project.shortDescription, type: "website" },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
