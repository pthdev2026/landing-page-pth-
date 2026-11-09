# 02 — Architecture UX & wireframes narratifs

## Sitemap
```
/                    Home (6 scènes, ancres #vision #mission #chiffres #origin #soutenir #participer)
/mentions-legales    Placeholder — à rédiger
/confidentialite     Placeholder — à rédiger (RGPD : formulaire)
/api/participate     POST — formulaire
```

## Navigation
Logo PTH · Vision · Mission · Origin · Nous soutenir · (droite) Être bénévole · Contact. Transparent dans le Hero, noir translucide dès le scroll. Mobile : bouton « Menu » → panneau plein écran.

## Parcours
| # | Section | Rôle | Idée dominante | CTA |
|---|---|---|---|---|
| 01 | Hero | Immersion | TÉMOIGNAGE monumental + manifeste | Être bénévole · Contact |
| 02 | Slogan | Rupture | « Le message ne change pas. » | — |
| 03 | Mission | Conviction / explication | Jésus vu à travers les vies transformées | — |
| 04 | Chiffres | Preuve | Derrière chaque chiffre, des personnes | — |
| 05 | Origin | Ambition | Une maison pour les histoires | — |
| 06 | Soutenir | Participation | Investir · Donner · Servir + formulaire | Formulaire |

---
## 01 — Hero (100svh min)
- **Message** : PTH est un vrai média, avec une vision.
- **Desktop** : mot TÉMOIGNAGE (rouge, dégradé flare→crimson→blood) pleine largeur, coupé aux bords, en fond ; manifeste blanc au premier plan (« témoignage. » en serif italique + soulignement dessiné) ; sous-texte ; 2 CTA.
- **Média** : vidéo d'interview très subtile dans/derrière les lettres — *à fournir*. Poster + fallback, jamais de 4K.
- **Entrée** : noir → mot → lumière → manifeste (masque ligne par ligne) → sous-texte → CTA.
- **Scroll** : le mot change d'échelle et s'assombrit (desktop).
- **Mobile** : mot recadré sur 1-2 lignes, sans parallax, CTA en bas à portée du pouce.

## 02a — Énoncé (ajoutée après la Hero)
- **Message** : « Nous racontons des histoires pour rendre visible ce que Dieu fait encore. »
- **Layout** : phrase immense, centrée, 3 lignes (4 sur mobile), Inter Tight 500, interlignage serré ; lueur rouge en fond.
- **Motion** : les mots se remplissent au scroll (blanc estompé → rouge), parallaxe légère du bloc et de la lueur (desktop).
- **Question ouverte** : cohabitation avec « Le message ne change pas… » (02b) — garder les deux, fusionner ou remplacer ?

## 02b — Slogan
- **Message** : la forme change, pas le fond.
- **Layout** : noir, MESSAGE géant bordeaux en fond ; « Le message ne change pas. » en display ; « la manière de le transmettre, oui. » en serif italique champagne ; micro-texte « Profondément chrétien dans notre substance. Contemporain dans notre langage. »
- **Motion** : révélation mot à mot, pause entre les deux phrases.

## 03 — Mission (4 scènes)
| Scène | Contenu | Composition |
|---|---|---|
| 1 Vocation | Vocation + « espaces de révélation » | Texte à gauche, portrait décalé à droite |
| 2 Voir Dieu à l'œuvre | Grâce · vérité · amour · justice · patience · puissance → « À travers des vies réelles. » | Mots monumentaux empilés, fond bordeaux |
| 3 Revenir à la source | Jésus par ce qu'il produit dans une vie | Une phrase, beaucoup de vide |
| 4 Renouveler la transmission | Journalisme · Cinéma · Storytelling · Digital · Création · IA · Technologie | Bandeau de mots monumentaux en défilement |
- Éviter « image gauche / texte droite » répété. Mobile : empilement vertical, défilement horizontal remplacé par un bandeau CSS.
- **Évolution prévue** : sections sticky pour les scènes 1-3 (desktop) une fois les portraits disponibles.

## 04 — Chiffres
- **Message** : « Une vision qui réunit déjà une communauté. »
- **Layout** : 200K+ monumental + légende ; puis Instagram · TikTok · YouTube · vues. **Pas de cartes KPI.**
- **Arrière-plan prévu** : captures, portraits, commentaires, fragments d'interfaces — *à fournir*.
- **Règle** : chiffres réels et vérifiés uniquement (placeholders atténués + `sr-only`).

## 05 — Ambition / Origin
Séquence : question « Et si toutes ces histoires avaient un lieu où se rencontrer ? » → pause → **ORIGIN** monumental → interface TV → desktop → mobile → catalogue (PTH Originals, témoignages, créateurs, films, séries, documentaires, podcasts) → promesse « une maison pour les histoires chrétiennes de notre génération » → « Parce qu'une mission a besoin d'un lieu pour grandir. » → mention « Plateforme actuellement en développement. »
- Les **interfaces sont le contenu visuel principal** (pas de screenshot dans une card). Maquettes *à fournir*.
- Mobile : un appareil à la fois, pas de scroll horizontal.
- Événement analytics : `section_origin_view`.

## 06 — Nous soutenir
Titre → 5 objectifs (produire, développer PTH Originals, construire Origin, accompagner des créateurs, faire grandir le média) → « Vous pouvez participer à sa construction. » → 3 entrées **Investir / Donner / Servir** (chaque CTA présélectionne le formulaire) → formulaire dynamique.

### Formulaire
Question « Comment souhaitez-vous participer ? » → Investir · Faire un don · Devenir bénévole · Devenir partenaire → seuls les champs du mode choisi apparaissent (voir `src/lib/forms/fields.js`).
| Mode | Champs |
|---|---|
| Investir | prénom, nom, email, téléphone, organisation, type de contribution, message |
| Bénévole | prénom, nom, email, compétence, métier, disponibilité, portfolio/LinkedIn, motivation |
| Partenaire | nom, organisation, email, nature du partenariat, message |
| Don | prénom, nom, email, montant envisagé, message — **paiement en ligne à intégrer** (fournisseur à choisir) |

## Footer
PTH · phrase de vision · navigation · Instagram / TikTok / YouTube (liens à fournir) · Contact · mentions légales · confidentialité.
