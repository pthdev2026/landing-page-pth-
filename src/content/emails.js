/**
 * Textes des emails (notification à l'équipe, confirmation au visiteur, remerciement de don).
 * ⚠ Rédigés par l'assistant, à VALIDER et à adapter au ton de PTH (ils ne viennent pas du brief).
 * `{clés}` sont remplacées à l'envoi.
 */
export const emails = {
  brand: "PTH — Partage Ton Histoire",
  tagline: "Répondre aux enjeux de notre temps par le témoignage.",

  team: {
    subject: "[PTH] Nouvelle demande — {mode} — {name}",
    preheader: "Nouvelle demande reçue depuis le site.",
    intro: "Une nouvelle demande vient d’arriver depuis le site.",
    replyHint: "Répondre à cet email écrit directement à la personne.",
    adminLink: "Voir toutes les demandes",
    messageLabel: "Message",
  },

  confirmation: {
    subject: "Merci, nous avons bien reçu votre message",
    preheader: "Nous revenons vers vous très vite.",
    greeting: "Bonjour {name},",
    body: "Merci pour votre message. Nous l’avons bien reçu ({mode}) et nous revenons vers vous très vite.",
    recapTitle: "Rappel de votre demande",
    signature: "L’équipe PTH",
    footer: "Vous recevez cet email parce que vous avez rempli le formulaire du site PTH. Répondez simplement à ce message pour toute question.",
  },

  donation: {
    subject: "Merci pour votre don à PTH",
    preheader: "Votre don est bien arrivé.",
    greeting: "Bonjour {name},",
    body: "Votre don de {amount}{frequency} est bien arrivé. Merci de nous aider à rendre visible ce que Dieu fait encore.",
    frequencyMonthly: " par mois",
    signature: "L’équipe PTH",
  },
};

/** Remplace `{clé}` par sa valeur (les clés absentes disparaissent). */
export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
