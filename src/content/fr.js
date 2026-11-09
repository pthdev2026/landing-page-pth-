/**
 * Contenu éditorial du site PTH (français).
 * Toute la copie vit ici : les composants ne contiennent aucun texte en dur.
 * Modifier un texte = modifier ce fichier uniquement.
 *
 * Les valeurs marquées `pending: true` sont des placeholders à remplacer
 * par des données réelles et vérifiées avant publication.
 */

export const site = {
  name: "PTH",
  fullName: "Partage Ton Histoire",
  vision: "Répondre aux enjeux de notre temps par le témoignage.",
  description:
    "PTH est un média chrétien contemporain qui raconte ce que Dieu accomplit dans la vie des hommes, avec les langages, les outils et la créativité de notre époque.",
};

export const nav = {
  links: [
    // `sections` : les sections de la page que le lien « couvre » (le menu flottant met en avant celui de la section en cours).
    { label: "Vision", href: "#histoires", sections: ["histoires", "qui"] },
    { label: "Mission", href: "#mission", sections: ["mission", "chiffres", "ambition"] },
    // Lien vers une autre page (pas une ancre) : Header.jsx le détecte via `pathname`, pas `sections`.
    { label: "Nos projets", href: "/projets", sections: [] },
    { label: "Origin", href: "#origin", sections: ["origin", "promesse", "formats", "maison"] },
    { label: "Nous soutenir", href: "#soutenir", sections: ["maintenant", "soutenir"] },
  ],
  actions: [
    { label: "Être bénévole", href: "#participer", mode: "volunteer", variant: "solid" },
    { label: "Contact", href: "#participer", mode: "contact", variant: "ghost" },
  ],
};

export const hero = {
  backdropWord: "TÉMOIGNAGE",
  // Manifeste en deux lignes (la 2e révèle le mot-clé en rouge). Source : image finale validée.
  headline: {
    lines: ["Répondre aux enjeux", "de notre temps par le"],
    accent: "témoignage.",
  },
  subtext:
    "PTH est un média chrétien contemporain qui raconte ce que Dieu fait dans la vie des hommes à travers des récits vrais, profonds et mémorables.",
  scrollHint: "Faire défiler",
  scrollHintTouch: "Glisser", // mobile : on glisse le pouce, on ne « défile » pas
  // Intro en sous-titres de cinéma (petit, majuscules, mot par mot) : la question dans le noir, puis la réponse.
  // **mot** = mot fort (gras). Modifier ici pour changer les mots mis en avant.
  intro: {
    question: "Dieu **agit-il** encore dans la vie des hommes **aujourd’hui** ?",
    answer: "**Oui.** Et on veut le montrer.",
    // Carte de bienvenue : au centre, dans le noir, juste avant que la salle ne s'allume (préambule des mains).
    welcome: "Bienvenue chez **PTH**",
  },
  ctas: [
    { label: "Être bénévole", href: "#participer", mode: "volunteer", variant: "signal" },
    { label: "Contact", href: "#participer", mode: "contact", variant: "outline" },
  ],
};

export const statement = {
  id: "histoires",
  text: "Nous racontons des histoires pour rendre **visible** ce que Dieu fait encore.",
  // Petites photos en pastille glissées dans la phrase, MOBILE seulement (idée reprise du mobile de Saki : texte + images en ligne).
  // Décoratives (aria-hidden) : le texte ci-dessus reste identique. `after` = mot après lequel la pastille s'insère.
  pills: [
    { after: "histoires", src: "/media/pills/temoignages.webp" },
    { after: "visible", src: "/media/pills/films-series.webp" },
  ],
};

export const who = {
  id: "qui",
  number: "02",
  label: "Qui sommes-nous",
  // Textes du brief (bloc 1, « ne pas modifier »). **mot** = mot d'accent (rouge), sans changer un mot.
  definition:
    "PTH est un média chrétien contemporain dédié aux histoires humaines, aux parcours de vie et aux transformations.",
  meeting:
    "Nous allons à la rencontre de femmes et d’hommes qui ont traversé le doute, la rupture, l’échec, la reconstruction, la foi, l’espérance ou le recommencement.",
  role: "Notre rôle est simple : écouter, comprendre, **raconter** et transmettre.",
  triad: [
    "DES VIES RÉELLES.",
    "DES HISTOIRES QUI PORTENT UNE TRACE.",
    "DES RÉCITS QUI PEUVENT DEVENIR UNE **RÉPONSE** POUR QUELQU’UN D’AUTRE.",
  ],
};

export const mission = {
  id: "mission",
  number: "03",
  label: "Notre mission",
  // Textes du brief (bloc 2, « ne pas modifier »).
  statement: "Faire connaître **Jésus** à travers les histoires qu'il transforme.",
  belief: "Nous croyons que le témoignage peut devenir un langage capable de parler à notre époque.",
  language: "Un langage humain, concret, accessible.",
  // Les cinq disciplines citées dans la dernière phrase (affichées en rangée, mêmes mots).
  disciplines: ["Cinéma", "Journalisme", "Éditorial", "Digital", "Création"],
  closing:
    "À travers le cinéma, le journalisme, l’éditorial, le digital et la création, nous voulons raconter la foi autrement, sans en diluer la substance.",
  // Portrait de la section Mission (4:5). `src: null` = placeholder ; déposer le fichier dans public/media/images/ puis renseigner
  // `src: "/media/images/mission-portrait.webp"` et un `alt` descriptif (ex. « Un témoin raconte son histoire, assis sur le plateau PTH »).
  media: {
    label: "Portrait humain",
    src: "/media/images/mission-portrait.webp",
    alt: "Un témoin raconte son histoire, assis dans un fauteuil en cuir sur le plateau d'interview de PTH.",
  },
};

export const stats = {
  id: "chiffres",
  number: "04",
  label: "Nos chiffres",
  title: "Nos histoires **voyagent déjà.**",
  intro: "Des récits qui touchent aujourd’hui des millions de personnes.",
  // AUCUN chiffre inventé. `value: null` = donnée manquante : la ligne est MASQUÉE (jamais de « XX » en public).
  // Données fournies par l'utilisateur le 2026-09-25. `decimals` = nb de décimales ; `wide` = chiffre principal en grand.
  items: [
    { label: "Instagram", unit: "abonnés", value: 147, decimals: 0, suffix: "K" },
    { label: "TikTok", unit: "abonnés", value: 19.1, decimals: 1, suffix: "K" },
    // ⚠️ « 10,5 » lu comme 10,5 K abonnés — à confirmer avec l'utilisateur.
    { label: "YouTube", unit: "abonnés", value: 10.5, decimals: 1, suffix: "K" },
    { label: "Audience cumulée", unit: "personnes touchées", value: 3, decimals: 0, prefix: "+", suffix: "M", wide: true },
    // À afficher dès que la donnée existe (retirer `value: null`) :
    { label: "Vues cumulées", unit: "", value: null, decimals: 0, suffix: "M", wide: true },
    { label: "Contenus publiés", unit: "", value: null, decimals: 0, suffix: "", wide: true },
  ],
  closing: ["Derrière chaque chiffre, une personne.", "Derrière chaque personne, une **histoire.**"],
};

export const ambition = {
  id: "ambition",
  number: "05",
  label: "Notre ambition",
  // **mot** = mot fort (gras) pour la question, mot d'accent (rouge) pour l'énoncé.
  question: "Et si toutes ces **histoires** avaient enfin un **lieu** où se rencontrer ?",
  lead: "PTH ne veut pas seulement publier du contenu.",
  statement: "Nous voulons construire un **écosystème** où les histoires, les créateurs et les productions chrétiennes peuvent se rencontrer.",
};

export const origin = {
  id: "origin",
  number: "06",
  label: "Origin — la plateforme",
  name: "ORIGIN",
  subtitle: "Le divertissement chrétien entre dans une **nouvelle ère.**",
  status: "En développement",
  kicker: "La plateforme",
  intro:
    "Origin est une plateforme pensée pour découvrir, regarder et partager le contenu chrétien dans toute sa **diversité.**",
  catalogue: ["Films.", "Séries.", "Documentaires.", "Témoignages.", "Podcasts.", "Créateurs.", "PTH Originals."],
  closingKicker: "Un seul espace",
  closing:
    "Un espace pour découvrir des histoires, des créateurs et des œuvres qui partagent une même conviction.",
};

export const promise = {
  id: "promesse",
  number: "07",
  label: "Notre promesse",
  // **mot** = mot d'accent (rouge)
  statement: "Se divertir sans mettre sa foi entre **parenthèses.**",
  kicker: "L'expérience",
  intro:
    "Origin veut offrir au contenu chrétien une expérience à la hauteur de son message.",
  attributesKicker: "Une plateforme",
  // La phrase du brief, décomposée en lignes éditoriales (même ordre, mêmes mots) :
  // « Une plateforme exigeante dans ses contenus, moderne dans son expérience, ambitieuse dans sa création
  //   et profondément chrétienne dans sa substance. »
  attributes: [
    { word: "exigeante", note: "dans ses contenus" },
    { word: "moderne", note: "dans son expérience" },
    { word: "ambitieuse", note: "dans sa création" },
    { word: "profondément chrétienne", note: "dans sa substance", accent: true },
  ],
  // Phrase forte — option retenue. Alternative du brief : « Du divertissement, sans compromis sur ce que nous croyons. »
  closing: ["Le divertissement chrétien,", "sans **compromis.**"],
};

export const formats = {
  id: "formats",
  number: "08",
  label: "Origin — les formats",
  title: "Ce qu’on trouvera sur **Origin**",
  status: "Aperçu à venir",
  // Textes du brief (§8). `image: null` = placeholder ; sinon chemin du visuel. `focus` = point de recadrage (object-position) : la même image
  // est montrée en 4:5 (bureau) et en 16:10 (mobile), ce point garde le sujet dans le cadre.
  items: [
    { title: "PTH Originals", text: "Des productions originales pensées et produites par PTH.", image: "/media/formats/originals.webp", focus: "50% 38%" },
    { title: "Films & séries", text: "Des histoires capables de divertir, émouvoir, questionner et transmettre.", image: "/media/formats/films-series.webp", focus: "50% 35%" },
    { title: "Documentaires", text: "Des récits réels, des enquêtes, des parcours et des sujets de société.", image: "/media/formats/documentaires.webp", focus: "50% 55%" },
    { title: "Témoignages", text: "Des vies réelles racontées avec profondeur.", image: "/media/formats/temoignages.webp", focus: "50% 22%" },
    { title: "Podcasts", text: "Des conversations qui prennent le temps d’aller au fond.", image: "/media/formats/podcasts.webp", focus: "82% 40%" },
    { title: "Créateurs", text: "Un espace pour découvrir des créateurs chrétiens et leurs univers.", image: "/media/formats/createurs.webp", focus: "50% 25%" },
    { title: "Divertissement", text: "Des formats pensés pour divertir, faire rire, surprendre et rassembler.", image: "/media/formats/divertissement.webp", focus: "50% 38%" },
  ],
};

export const house = {
  id: "maison",
  number: "09",
  label: "La maison d’Origin",
  // Textes du brief (§9). **mot** = mot d'accent (rouge).
  statement: "Construire la **maison** du contenu chrétien de notre génération.",
  lead: "Origin ne sera pas seulement un catalogue de vidéos.",
  platform:
    "Nous voulons créer une plateforme où les créateurs, les histoires et les productions chrétiennes peuvent se rencontrer, grandir et trouver leur public.",
  believers: "Un lieu où chacun peut retrouver des contenus en accord avec sa foi, ses questions et ce qu’il traverse.",
  seekers:
    "Et où quelqu’un qui ne connaît pas encore Christ peut découvrir, simplement par une **histoire**, quelque chose qu’il n’était pas venu chercher.",
};

export const why = {
  id: "maintenant",
  number: "10",
  label: "Pourquoi maintenant",
  // Textes du brief (§10). **mot** = mot d'accent (rouge), sans changer un mot.
  statement: "Parce que notre génération regarde **autrement.**",
  // Photos (2026-10-21, fournies par l'utilisateur, retouchées rouge/noir — voir docs/09-roadmap.md) : c'était
  // ici qu'il manquait de vrais visuels (cartes en lueur teintée seule jusqu'ici), pas sur /projets.
  cards: [
    { text: "Elle **découvre** le monde à travers les écrans.", image: "/media/images/origin-couleur-1.webp" },
    { text: "Elle suit des **créateurs** autant que des institutions.", image: "/media/images/origin-couleur-7.webp" },
    { text: "Elle regarde, écoute, partage et se **construit** à travers des histoires.", image: "/media/images/origin-couleur-4.webp" },
    { text: "Elle attend des contenus aussi **exigeants** dans le fond que dans la forme.", image: "/media/images/origin-couleur-8.webp" },
  ],
  closing: ["Le message ne change pas.", "La manière de le **transmettre,** oui."],
};

export const member = {
  id: "membre",
  number: "13",
  label: "Devenir membre",
  // Textes du brief (§13). **mot** = mot d'accent (rouge). Le sens concret de « membre » reste à définir
  // (newsletter, communauté privée, accès anticipé, Discord, événements…).
  title: "Rejoindre PTH, ce n’est pas seulement suivre un média.",
  text: "C’est rejoindre une **communauté** de personnes qui croient que les histoires peuvent toucher, transmettre et transformer.",
  cta: "Rejoindre la communauté",
};

export const contact = {
  id: "contact",
  number: "14",
  label: "Contact",
  // Textes du brief (§14).
  title: "Vous voyez une **place** pour vous dans cette vision ?",
  text: "Parlons-en.",
  cta: "Nous contacter",
};

// Bloc dédié au don (pas dans le sélecteur générique « Comment souhaitez-vous participer ? » — demande utilisateur
// du 2026-10-13 : « il faut un bloc spécial dédié à ça »). Juste après Support (§11-12) dans la page.
export const donate = {
  id: "don",
  kicker: "Donner",
  title: "Faire un **don.**",
  // Plus court et direct (demande du 2026-10-14 : « pas assez concis et dynamique », la photo doit respirer).
  intro: "Chaque don finance nos prochaines histoires.",
  // Le repère « données bancaires » est retiré d'ici (demande du 2026-10-14) : il reste près du bouton d'envoi
  // (voir `donateSubmit` plus bas dans ce fichier) — pas besoin de le répéter, la photo a besoin de place.
  points: ["Paiement sécurisé par Stripe.", "Ponctuel ou récurrent, annulable à tout moment."],
  // Photo fournie par l'utilisateur le 2026-10-14 (source : 735×739, correcte pour ce format de carte —
  // à remplacer par une version plus grande si le panneau grandit un jour). `MediaFrame` non utilisé ici :
  // la photo sert de fond avec du texte dessus (voir `Donate.jsx` / `donate.module.css`), pas d'un cadre isolé.
  media: {
    src: "/media/images/donate-portrait.webp",
    alt: "Portrait chaleureux d'une femme souriante, bras tendu vers l'objectif, sur le perron d'une maison.",
  },
};

export const support = {
  id: "soutenir",
  number: "11",
  label: "Soutenir la vision",
  // Textes du brief (§11 et §12, verbatim). **mot** = mot d'accent (rouge).
  title: "Cette vision se construit **maintenant.**",
  goals: [
    "Produire davantage d’histoires.",
    "Développer PTH Originals.",
    "Construire Origin.",
    "Accompagner de nouveaux créateurs.",
    "Faire grandir un média capable de rejoindre notre génération.",
  ],
  conclusion: "Vous pouvez prendre part à cette **histoire.**",
  waysNumber: "12",
  waysLabel: "Trois manières de participer",
  entries: [
    {
      mode: "invest",
      kicker: "Investir",
      title: "Faire grandir le projet.",
      text: "Vous êtes investisseur, entrepreneur ou partenaire et souhaitez prendre part au développement de PTH et d’Origin ?",
      cta: "Parler avec l’équipe",
    },
    {
      mode: "donate",
      kicker: "Donner",
      title: "Soutenir la mission.",
      text: "Votre soutien permet de produire de nouvelles histoires, de développer nos formats et de construire les prochaines étapes du projet.",
      cta: "Faire un don",
    },
    {
      mode: "volunteer",
      kicker: "Devenir bénévole",
      title: "Mettre ses talents au service de la vision.",
      text: "Créatif, vidéaste, journaliste, développeur, communicant, designer, monteur, organisateur ou simplement prêt à servir : PTH se construit aussi grâce à celles et ceux qui mettent leurs compétences au service de cette mission.",
      cta: "Devenir bénévole",
    },
  ],
};

export const form = {
  question: "Comment souhaitez-vous participer ?",
  modes: [
    { mode: "invest", label: "Investir" },
    // Pas « Faire un don » ici : bloc dédié, voir Donate.jsx (demande utilisateur du 2026-10-13).
    { mode: "volunteer", label: "Devenir bénévole" },
    { mode: "partner", label: "Devenir partenaire" },
    { mode: "member", label: "Rejoindre la communauté" },
    { mode: "contact", label: "Nous contacter" },
  ],
  submit: "Envoyer",
  sending: "Envoi…",
  success: {
    title: "Merci.",
    text: "Votre message est bien arrivé. Nous revenons vers vous très vite.",
  },
  error: "Une erreur est survenue. Réessayez dans un instant ou écrivez-nous directement.",
  // Microcopie de consentement (RGPD) : ajoutée par l'assistant, à valider avec le texte de confidentialité.
  memberNotice:
    "En rejoignant PTH, vous acceptez de recevoir de nos nouvelles par email. Vous pouvez vous désinscrire à tout moment.",
  donateNotice:
    "Le paiement en ligne sécurisé arrive bientôt. En attendant, laissez-nous vos coordonnées : nous vous recontactons pour finaliser votre don.",
  // Don en ligne (quand un prestataire de paiement est activé). ⚠ Rédigé par l'assistant : à valider.
  donateOnlineNotice: "Paiement sécurisé : vous serez redirigé vers la page de paiement de notre prestataire. Vos données bancaires ne passent jamais par ce site.",
  amountLabel: "Montant du don",
  customAmount: "Autre montant (€)",
  frequencyOnce: "Don ponctuel (une seule fois)",
  frequencyMonthly: "Récurrent (chaque mois)",
  donateSubmit: "Continuer vers le paiement",
  checking: "Vérification en cours, réessayez dans un instant.",
};

// Page de retour après un don (/merci). ⚠ Rédigé par l'assistant : à valider.
export const thanks = {
  title: "Merci.",
  text: "Votre don est bien arrivé. Grâce à vous, nous pouvons continuer à rendre visible ce que Dieu fait encore.",
  back: "Retour au site",
};

export const ending = {
  id: "fin",
  // Textes du brief (§15). **mot** = mot fort (gras) dans le sous-titre.
  sentence: "Il reste encore beaucoup d’**histoires** à raconter.",
  brand: "PTH",
  fullName: "Partage Ton **Histoire**",
};

export const footer = {
  tagline: site.vision,
  socials: [
    // href: null = pas encore fourni → le lien n'est pas affiché. Renseigner les URLs pour les faire apparaître.
    { label: "Instagram", href: "https://www.instagram.com/partage_ton.histoire/" },
    { label: "TikTok", href: null },
    { label: "YouTube", href: "https://www.youtube.com/@partagetonhistoire" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
};

/**
 * Page /projets — « Nos projets » (brief du 2026-10-18). Textes exacts du brief, verbatim. Page de conviction et
 * de conversion, plus directe que l'accueil (qui garde le rôle cinématographique/émotionnel).
 */
export const projectsPage = {
  meta: {
    title: "Nos projets | Partage Ton Histoire",
    description:
      "Découvrez les projets développés par PTH pour raconter les histoires de foi, transmettre l'Évangile et transformer la valeur créée en impact concret.",
  },
  nav: [
    { label: "Vision", href: "#vision" },
    { label: "ORIGIN", href: "#origin" },
    { label: "Projets", href: "#catalogue" },
    { label: "Soutenir", href: "#soutenir" },
  ],
  hero: {
    title: "Nos projets",
    subtitle: "Gratuit à recevoir, coûteux à transmettre.",
    ctaPrimary: "Investir dans la mission",
    ctaSecondary: "Découvrir ORIGIN",
  },
  why: {
    id: "vision",
    title: "L'Évangile est gratuit. Le transmettre exige des moyens.",
    text: [
      "Derrière chaque histoire, il y a une personne qui accepte de parler et une équipe qui écoute, écrit, filme, monte, diffuse et accompagne.",
      "Notre direction vient de Dieu. Mais notre mission avance aussi grâce à celles et ceux qui choisissent de la porter concrètement.",
      "Votre soutien permet à PTH de faire vivre une équipe, de produire de nouvelles histoires, de maintenir ses outils et de construire les projets qui porteront la mission plus loin.",
    ],
    realities: [
      { title: "Filmer", text: "Accueillir chaque personne, organiser les tournages et recueillir son histoire avec dignité." },
      { title: "Produire", text: "Transformer ces récits en œuvres fortes, humaines et capables d'être transmises." },
      { title: "Structurer", text: "Faire vivre les équipes éditoriales, créatives, techniques et administratives qui portent la mission." },
      { title: "Diffuser", text: "Maintenir les outils et les moyens nécessaires pour que chaque histoire atteigne ceux qui ont besoin de l'entendre." },
      { title: "Construire", text: "Développer ORIGIN et les futurs projets médiatiques et solidaires de l'association." },
    ],
    closing: "L'Évangile ne se vend pas. Mais pour qu'il soit raconté, produit et transmis avec excellence, il faut du temps, des compétences et des moyens.",
  },
  origin: {
    id: "origin",
    overline: "Projet en cours de développement",
    title: "ORIGIN",
    tagline: "Rendre visible ce que Dieu fait. Et faire de cette visibilité une ressource pour agir.",
    text: [
      "ORIGIN est la plateforme de streaming développée par PTH pour réunir des films, séries, documentaires, podcasts et témoignages qui racontent la foi en action.",
      "Nous voulons offrir à ces récits un espace exigeant, accessible et capable de les transmettre à une nouvelle génération.",
      "Mais ORIGIN porte une ambition plus large : une partie des ressources générées par la plateforme contribuera au soutien d'associations et d'actions caritatives partenaires.",
    ],
    dimensions: [
      { title: "Raconter", text: "Donner une place aux histoires de transformation et aux créations chrétiennes qui méritent d'être vues et transmises." },
      { title: "Rassembler", text: "Créer un espace commun pour les spectateurs, les créateurs, les églises et les organisations qui partagent cette vision." },
      { title: "Redistribuer", text: "Transformer une partie de la valeur créée par ORIGIN en soutien concret pour des initiatives caritatives." },
    ],
    disclaimer:
      "Les modalités de redistribution, les partenaires concernés et la part des ressources allouée seront publiés dès la validation officielle du modèle.",
    ctaPrimary: "Investir dans ORIGIN",
    ctaSecondary: "Découvrir le projet",
  },
  catalogue: {
    id: "catalogue",
    title: "Des convictions qui deviennent des œuvres.",
    intro: "Chaque projet PTH naît d'un besoin réel, poursuit une mission précise et mobilise les moyens nécessaires pour produire un impact durable.",
    filters: [
      { value: "all", label: "Tous" },
      { value: "development", label: "En développement" },
      { value: "active", label: "Actifs" },
      { value: "completed", label: "Réalisés" },
      { value: "upcoming", label: "À venir" },
    ],
  },
  support: {
    id: "soutenir",
    title: "La suite dépend aussi de ceux qui choisissent de la rendre possible.",
    text: [
      "Vous pouvez soutenir PTH une fois, porter la mission chaque mois, devenir partenaire ou mettre vos compétences au service d'un projet.",
      "Choisissez la manière dont vous souhaitez agir.",
    ],
    finance: {
      title: "Soutenir financièrement",
      frequencyOnce: "Don ponctuel",
      frequencyMonthly: "Don mensuel",
      onceText: "Choisissez librement votre montant à partir de 10 €.",
      monthlyAmounts: [20, 50, 100, 150],
      submit: "Soutenir maintenant",
      mention: "Votre contribution constitue un don. Elle n'accorde aucune participation au capital ni aucun rendement financier.",
    },
    follow: {
      kicker: "Suivre les projets",
      title: "Suivre les projets",
      text: "Recevez les avancées, les prochains besoins et les résultats des projets que vous choisissez de suivre.",
      emailLabel: "Votre adresse e-mail",
      consentLabel: "J'accepte de recevoir les actualités des projets PTH par e-mail.",
      submit: "Recevoir les avancées",
      success: "Merci, votre inscription est confirmée.",
      error: "Une erreur est survenue. Réessayez dans un instant.",
    },
    partner: {
      kicker: "Construire un partenariat",
      title: "Construire un partenariat",
      text: "Vous représentez une entreprise, une église, une association ou une fondation ? Construisons ensemble un engagement adapté à votre organisation.",
      ctaPrimary: "Contacter l'équipe",
      ctaSecondary: "Prendre rendez-vous",
    },
    volunteer: {
      title: "Donner de son temps",
      text: "Vous souhaitez mettre vos compétences, votre expérience ou votre disponibilité au service de la mission ?",
      cta: "Devenir bénévole",
    },
  },
  closing: {
    title: "Une histoire peut relever une vie. Votre soutien peut lui permettre d'être entendue.",
    cta: "Soutenir PTH",
  },
  project: {
    statusLabel: "Statut",
    objectivesTitle: "Ce que ce projet rend possible",
    fundingTitle: "À quoi sert votre soutien",
    back: "← Tous les projets",
    donate: "Soutenir ce projet",
  },
};
