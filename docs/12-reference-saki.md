# 12 — Analyse de référence : sakiproducts.com (2026-09-25)

Analyse demandée par l'utilisateur : « répartition des éléments, gestion et taille des polices, menu, animations — simple, beau, élégant, direct ». Relevé fait dans le navigateur intégré (DOM, styles calculés). **Rien n'a été accepté/refusé sur le bandeau cookies.** Site = boutique Shopify (petit électroménager) : produit et catalogue, pas cinéma — on récupère des **codes**, pas une identité.

## Mesures (desktop 1440 px)
**Police** : *PP Object Sans* (Pangram Pangram), **deux graisses seulement : 400 (titres, texte) et 500 (menu, libellés)**. Aucune serif, aucune seconde famille.
**Échelle** (px, nb d'éléments) : 80 (titre du héros) · 52 (titres de section) · 48 (énoncé / sous-titres) · 38 (titres secondaires) · 32 · 20 (entrées de menu, noms produits) · 18 · 16 (corps) · **14 (le plus utilisé : 41 éléments — libellés, boutons, descriptions)** · 12 (micro). Soit ~8 tailles, rapport ≈ 1,5 entre niveaux.
**Titres** : graisse **400**, interlettrage **−5 %** (−2,6 px à 52 px ; −2 px à 80 px), interligne **1,15** (1,0 pour le titre de 80 px).
**Couleurs** : deux neutres — noir `#121212` / blanc + crème `#f8f3ee` — et **un seul accent : `#ff3b25` (rouge-orangé), sur UN mot par titre** (« Perfected », « Lovers »). États atténués : le paragraphe d'énoncé (48 px) passe de 20 % d'opacité à 100 % au scroll (comme notre Énoncé).
**Répartition** : conteneur avec grandes marges latérales (80 px ≈ 5,5 %), sections **plein cadre alternant sombre / clair**, très grand padding vertical (≈ 80-160 px), page courte (~9 200 px, 7 sections). Chaque section = **une idée** : pastille-étiquette (« Tea Makers ») + titre + 1 court paragraphe (14-16 px, gris) + **1 bouton pilule** + 1 grand visuel. Cartes à rayon 16-24 px, filets fins, collage d'images à coins arrondis.
**Menu** : `header` sticky **transparent, pleine largeur, `pointer-events: none`** ; seuls **trois éléments flottants** captent les clics : **logo** (mot « Saki » → **monogramme rond** dès qu'on scrolle), **capsule centrale** (44 px de haut, `#303030`, rayon total, bordure 1 px blanc 5 %, entrées 14 px, sans flou), **bouton rond** (panier). « Products » ouvre un **méga-menu** (liste 20 px/500 + carte produit). **Mobile** : logo rond + pastille « Menu ⌄ » + bouton rond.
**Boutons** : pilules, 14 px / 500, flèche `→`, hauteur ~44 ; principal noir sur clair / blanc sur sombre.
**Pied de page** : sombre, trois cartes-image (rayon ~20 px, libellé + pastille chevron) et un **logo géant, très estompé, rogné** en bas.
**Animations** (aucune lib globale détectée, pas de CSS scroll-timeline) : héros = **boucle vidéo muette** (poster, AV1/webm) ; **remplissage du texte au scroll** ; **carrousel produit** avec titre qui change (fin de titre en dégradé vers transparent) ; **repères « + » qui pulsent** (3 anneaux `ping` décalés) ; morphing du logo ; transitions de survol. **Pas de verrouillage de scroll.** Sobriété : peu d'effets, tous fonctionnels.

## À récupérer pour PTH (sans perdre l'identité cinéma)
1. **Discipline typographique** : une famille, 2 graisses, titres en 400 / −5 % / interligne 1,1-1,15, échelle réduite. 
2. **Un seul mot d'accent rouge-orangé par titre** (remplace la serif italique éparpillée).
3. **Menu flottant** : logo (→ monogramme) + capsule centrale + pastille d'action ronde ; mobile « Menu ⌄ ».
4. **Boutons pilules partout** (14 px / 500, flèche) ; **cartes à rayon ~20 px** (cohérence avec les pilules).
5. **Une idée par section** : étiquette, titre, une courte phrase, un bouton, un visuel.
6. **Pied de page** : logo PTH géant estompé + phrase de clôture.
7. **Rythme plus direct** : raccourcir les scrolls épinglés (Hero 480 %, Ambition 400 %, Origin 340 %).
8. **Carrousel à focus** (titre qui change) pour « Ce qu'on trouvera sur Origin ». Options : pastilles-photo inline dans un titre ; repères « + » pulsés sur les maquettes Origin.

## À garder (identité PTH)
Hero cinéma et sa séquence, question/réponse en sous-titres, lumière/écran, dégradé argent des titres, univers rouge → noir, étiquettes numérotées, texte qui se remplit.


## Analyse MOBILE (2026-09-26) — ce qu'on a retenu, et pas plus
Observé : plein cadre vidéo en tête avec grand titre clair aligné à gauche ; menu flottant (monogramme rond + pastille « Menu » + bouton rond d'action) ; phrase d'ouverture dont les mots se remplissent et où sont **glissées de petites photos en pastille** ; section produit sombre avec **sélecteur de miniatures** ; cartes horizontales qui « dépassent » du bord ; aucune bibliothèque d'animation.
**Repris pour PTH mobile** : (1) pastilles-photo dans la phrase de l'Énoncé ; (2) pellicule de vignettes sous l'image des Formats ; (3) bouton rond d'action à côté de « Menu ». **Écarté** : étiquettes au-dessus des titres, carrousel horizontal (scroll horizontal = fragile), grand titre en bas à gauche (notre manifeste reste centré).
