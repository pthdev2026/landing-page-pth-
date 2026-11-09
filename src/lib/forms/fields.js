/**
 * Définition déclarative des champs par mode. Le formulaire est généré depuis ce fichier :
 * ajouter/retirer un champ = éditer ici (+ le schéma zod correspondant).
 * `wide: true` = pleine largeur ; `type: "textarea"` = zone de texte.
 */
export const fieldsByMode = {
  invest: [
    { name: "firstName", label: "Prénom", autoComplete: "given-name" },
    { name: "lastName", label: "Nom", autoComplete: "family-name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel", optional: true },
    { name: "organization", label: "Entreprise / organisation", autoComplete: "organization", optional: true },
    { name: "contribution", label: "Type de contribution envisagée", optional: true },
    { name: "message", label: "Message", type: "textarea", wide: true, optional: true },
  ],
  donate: [
    { name: "firstName", label: "Prénom", autoComplete: "given-name" },
    { name: "lastName", label: "Nom", autoComplete: "family-name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "amount", label: "Montant envisagé", optional: true },
    { name: "message", label: "Message", type: "textarea", wide: true, optional: true },
  ],
  volunteer: [
    { name: "firstName", label: "Prénom", autoComplete: "given-name" },
    { name: "lastName", label: "Nom", autoComplete: "family-name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "skill", label: "Compétence" },
    { name: "job", label: "Métier", optional: true },
    { name: "availability", label: "Disponibilité", optional: true },
    { name: "portfolio", label: "Portfolio / LinkedIn", type: "url", wide: true, optional: true },
    { name: "message", label: "Pourquoi souhaitez-vous rejoindre PTH ?", type: "textarea", wide: true },
  ],
  partner: [
    { name: "name", label: "Nom", autoComplete: "name" },
    { name: "organization", label: "Organisation", autoComplete: "organization" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "partnership", label: "Nature du partenariat" },
    { name: "message", label: "Message", type: "textarea", wide: true },
  ],
  member: [
    { name: "firstName", label: "Prénom", autoComplete: "given-name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "message", label: "Ce que vous aimeriez vivre avec PTH", type: "textarea", wide: true, optional: true },
  ],
  contact: [
    { name: "name", label: "Nom", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "message", label: "Message", type: "textarea", wide: true },
  ],
  newsletter: [{ name: "email", label: "Email", type: "email", autoComplete: "email" }],
};

export const modeLabels = {
  invest: "Investir",
  donate: "Don",
  volunteer: "Bénévole",
  partner: "Partenaire",
  member: "Membre",
  contact: "Contact",
  newsletter: "Lettre d'actus",
};
