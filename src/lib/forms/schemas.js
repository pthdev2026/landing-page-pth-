import { z } from "zod";

/**
 * Schémas de validation — utilisés côté client (react-hook-form) ET côté serveur
 * (route /api/participate). Une seule définition, zéro divergence.
 */

const text = (max = 120) => z.string().trim().min(1, "Ce champ est requis.").max(max, "Texte trop long.");
const optionalText = (max = 200) => z.string().trim().max(max, "Texte trop long.").optional().or(z.literal(""));
const email = z.string().trim().min(1, "Ce champ est requis.").email("Adresse email invalide.").max(160);
const message = (required = false) =>
  (required ? z.string().trim().min(10, "Quelques mots de plus, s'il vous plaît.") : z.string().trim())
    .max(4000, "Message trop long.");

// Champ piège anti-spam : invisible pour les humains. Un bot le remplit ;
// la route API l'accepte puis l'ignore en silence (faux succès), voir api/participate.
const honeypot = z.string().max(200).optional();

export const investSchema = z.object({
  mode: z.literal("invest"),
  firstName: text(),
  lastName: text(),
  email,
  phone: optionalText(40),
  organization: optionalText(),
  contribution: optionalText(),
  message: message(),
  website: honeypot,
});

export const donateSchema = z.object({
  mode: z.literal("donate"),
  firstName: text(),
  lastName: text(),
  email,
  amount: optionalText(40),
  frequency: z.enum(["once", "monthly"]).optional(),
  message: message(),
  website: honeypot,
});

/** Don en ligne (paiement) : règles du brief technique (2026-10-13) — jamais le front-end comme seule autorité.
 * Montant libre des DEUX côtés (ponctuel ET mensuel) depuis le 2026-10-14 (demande utilisateur : « oui, montant
 * libre aussi pour le mensuel ») — même plancher, même plafond, quelle que soit la fréquence. Les montants
 * suggérés (10/50/100 €) ne sont que des boutons de confort côté formulaire, plus une contrainte serveur : Stripe
 * crée un prix à la volée (`price_data`, y compris pour l'abonnement mensuel) à partir du montant choisi, plus
 * besoin de Price ID fixes créés à l'avance dans le Dashboard.
 */
export const DONATION_ONCE_MIN = 10;
export const DONATION_ONCE_MAX = 100_000; // plafond technique/anti-fraude, pas un plafond commercial (bien sous la limite Stripe)

/** Don en ligne (paiement) : montant en euros, même plage libre pour le ponctuel et le mensuel (10 € mini).
 * Utilisé par /api/donate et le formulaire. `idempotencyKey` : UUID v4 généré par le navigateur pour chaque
 * tentative de paiement, réutilisé tel quel si la requête est relancée (clé d'idempotence Stripe). */
export const donationCheckoutSchema = z
  .object({
    // Optionnels : le bloc de don dédié ne demande que l'email (Stripe Checkout recueille lui-même le nom pour le
    // paiement) — le prénom reste facultatif, juste pour personnaliser l'email de remerciement.
    firstName: optionalText(),
    lastName: optionalText(),
    email,
    message: message(),
    amount: z.coerce.number({ message: "Montant invalide." }).positive("Montant invalide."),
    frequency: z.enum(["once", "monthly"]).default("once"),
    idempotencyKey: z.string().uuid("Requête invalide, rechargez la page.").optional(),
    // Don fléché vers un projet précis (page /projets, 2026-10-18) : juste une CHAÎNE ici — le schéma ne connaît
    // pas la liste des projets valides (elle vit dans le contenu, pas dans la couche de validation générique).
    // La route /api/donate revérifie ce slug contre le vrai catalogue avant de l'inscrire en métadonnée Stripe ;
    // jamais un identifiant Stripe choisi par le navigateur (prix, Price ID…), juste une étiquette informative.
    project: optionalText(60),
    website: honeypot,
  })
  // `Math.round(x)` renvoie TOUJOURS un entier, quel que soit x : vérifier `Number.isInteger` sur son résultat ne
  // sert à rien (ancien bug). Le bon test : l'arrondi au centime ne doit (quasi) rien changer au montant donné —
  // l'écart résiduel vient seulement de l'imprécision des flottants (epsilon), jamais d'une vraie 3ᵉ décimale.
  .refine((data) => Math.abs(data.amount * 100 - Math.round(data.amount * 100)) < 1e-6, {
    message: "Le montant ne peut pas avoir plus de deux décimales.",
    path: ["amount"],
  })
  .refine((data) => data.amount >= DONATION_ONCE_MIN && data.amount <= DONATION_ONCE_MAX, {
    message: `Le montant minimum est de ${DONATION_ONCE_MIN} €.`,
    path: ["amount"],
  });

export const volunteerSchema = z.object({
  mode: z.literal("volunteer"),
  firstName: text(),
  lastName: text(),
  email,
  skill: text(),
  job: optionalText(),
  availability: optionalText(),
  portfolio: optionalText(300),
  message: message(true),
  website: honeypot,
});

export const partnerSchema = z.object({
  mode: z.literal("partner"),
  name: text(),
  organization: text(),
  email,
  partnership: text(),
  message: message(true),
  website: honeypot,
});

export const memberSchema = z.object({
  mode: z.literal("member"),
  firstName: text(),
  email,
  message: message(),
  website: honeypot,
});

export const contactSchema = z.object({
  mode: z.literal("contact"),
  name: text(),
  email,
  message: message(true),
  website: honeypot,
});

/** Lettre d'actus des projets (page /projets, 2026-10-18) : juste l'email + un consentement explicite, jamais
 * coché par défaut (RGPD) — voir `NewsletterForm.jsx`. Réutilise /api/participate et le stockage `leads`
 * existants (mode dédié) plutôt qu'une route ou une table à part. */
export const newsletterSchema = z.object({
  mode: z.literal("newsletter"),
  email,
  consent: z.literal(true, { message: "Cochez la case pour vous abonner." }),
  website: honeypot,
});

export const schemasByMode = {
  invest: investSchema,
  donate: donateSchema,
  volunteer: volunteerSchema,
  partner: partnerSchema,
  member: memberSchema,
  contact: contactSchema,
  newsletter: newsletterSchema,
};

export const participationSchema = z.discriminatedUnion("mode", [
  investSchema,
  donateSchema,
  volunteerSchema,
  partnerSchema,
  memberSchema,
  contactSchema,
  newsletterSchema,
]);
