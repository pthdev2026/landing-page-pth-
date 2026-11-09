/**
 * Catalogue des projets PTH (page /projets, brief du 2026-10-18).
 * Une seule source de vérité : la page principale, les fiches `/projets/[slug]` et le module de dons en lisent
 * toutes les trois. Ajouter un projet = ajouter une entrée ici (le reste suit automatiquement : filtre par
 * statut, routage, don fléché).
 *
 * Forme de chaque entrée (JSDoc, pas de TypeScript dans ce dépôt — voir AGENTS.md) :
 * @typedef {Object} Project
 * @property {string} slug
 * @property {string} title
 * @property {"development"|"active"|"completed"|"upcoming"} status
 * @property {string} category
 * @property {string} shortDescription   — carte du catalogue
 * @property {string} fullDescription    — fiche détaillée
 * @property {string} image
 * @property {string} imageAlt
 * @property {string[]} objectives       — « ce que ce projet rend possible »
 * @property {string[]} [fundingNeeds]   — à quoi sert concrètement le soutien (jamais un chiffre inventé)
 * @property {number} [progress]         — 0–100 ; ABSENT tant qu'aucune donnée réelle n'existe (jamais une fausse progression)
 * @property {boolean} donationEnabled
 * @property {boolean} newsletterEnabled
 * @property {boolean} contactEnabled
 * @property {string} [calendlyUrl]      — lien de prise de rendez-vous propre à ce projet, s'il existe
 * @property {string} cta                — libellé du bouton d'action principal sur la carte
 */

/** @type {Project[]} */
export const projects = [
  {
    slug: "origin",
    title: "ORIGIN",
    status: "development",
    category: "Plateforme",
    shortDescription: "La plateforme de streaming dédiée aux films, séries, documentaires, podcasts et témoignages chrétiens.",
    fullDescription:
      "ORIGIN est une plateforme de streaming chrétienne consacrée aux films, séries, documentaires, podcasts et témoignages qui racontent la foi en action. Nous la construisons pour offrir aux récits chrétiens un environnement médiatique exigeant, accessible sur mobile, ordinateur et télévision. Mais ORIGIN porte une ambition plus large : faire de la valeur générée par la plateforme un moyen de soutenir d'autres projets du Royaume et des actions caritatives concrètes.",
    image: "/media/images/origin-poster.webp",
    imageAlt: "Une salle de projection dans la pénombre, faisceau de projecteur traversant la fumée.",
    objectives: [
      "Donner une place aux histoires de transformation et aux créations chrétiennes exigeantes.",
      "Créer un espace commun pour les spectateurs, les créateurs et les organisations qui partagent cette vision.",
      "Consacrer une partie des ressources générées par ORIGIN au soutien d'associations et d'actions caritatives partenaires.",
    ],
    fundingNeeds: [
      "Développer la plateforme (ingénierie, hébergement, sécurité)",
      "Produire et acquérir des contenus originaux",
      "Structurer l'équipe éditoriale et technique",
    ],
    donationEnabled: true,
    newsletterEnabled: true,
    contactEnabled: true,
    cta: "Découvrir ORIGIN",
  },
  {
    slug: "pth",
    title: "PTH — Partage Ton Histoire",
    status: "active",
    category: "Média",
    shortDescription:
      "Un média consacré aux histoires de transformation. PTH identifie, accompagne, filme et diffuse des témoignages afin que l'histoire d'une personne puisse devenir une ressource pour une autre.",
    fullDescription:
      "PTH est un média consacré aux histoires de transformation. Il identifie, accompagne, filme et diffuse des témoignages afin que l'histoire d'une personne puisse devenir une ressource pour une autre. PTH existe déjà. Votre soutien lui permet de continuer à produire, de structurer son équipe et de préparer les projets de demain.",
    image: "/media/images/mission-portrait.webp",
    imageAlt: "Un témoin raconte son histoire, assis dans un fauteuil en cuir sur le plateau d'interview de PTH.",
    objectives: [
      "Identifier et accompagner des personnes qui ont une histoire de transformation à raconter.",
      "Filmer et produire ces témoignages avec dignité et exigence.",
      "Diffuser ces récits pour qu'ils deviennent une ressource pour quelqu'un d'autre.",
    ],
    fundingNeeds: [
      "Organiser les tournages et accueillir les personnes filmées",
      "Monter, habiller et produire les récits",
      "Rémunérer l'équipe éditoriale, créative et technique",
      "Maintenir les outils et la diffusion",
    ],
    donationEnabled: true,
    newsletterEnabled: true,
    contactEnabled: true,
    cta: "Soutenir PTH",
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function isValidProjectSlug(slug) {
  return typeof slug === "string" && projects.some((p) => p.slug === slug);
}

export const projectStatusLabels = {
  development: "En développement",
  active: "Actif",
  completed: "Réalisé",
  upcoming: "À venir",
};
