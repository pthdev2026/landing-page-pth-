# 18 — Les 7 visuels de la section « Ce qu'on trouvera sur Origin » (prompts)

Les prompts complets (en anglais, prêts à coller) sont dans la conversation du 2026-09-26 ; ce document résume la **méthode**, les **noms de fichiers** et le **branchement**.

## Principes communs (une seule famille d'images)

- **Format** : 1:1 (carré), sujet **centré dans les 55 % du milieu**, grande marge autour. La même image est recadrée en **4:5** (bureau) et en **16:10** (mobile, cadre collant).
- **Livraison** : PNG ou WebP, ≥ 2000 × 2000 px.
- **Style** : photographie de documentaire de cinéma, faible lumière (low-key), noirs profonds, palette noir / rouge profond / ambre chaud, lumière tungstène latérale, grain 35 mm, léger halo dans les hautes lumières, matières réelles et imperfections.
- **Interdits** (dans chaque prompt) : texte, logo, filigrane, interface d'écran lisible, symboles religieux, croix, halos, lumière « divine », look banque d'images, peau plastique, teinte cyan / bleu-violet.
- **RÉALISME (v2, demande utilisateur : « je veux une touche réaliste »)** : la première version, sans visages, donnait des natures mortes trop propres. La v2 met de **vraies personnes prises sur le vif** : visages **détournés, de profil, de trois quarts ou partiels** (plus crédibles qu'un visage de face), regard **hors cadre**, mains visibles, et un **bloc REALISME** dans chaque prompt (peau avec pores, teint irrégulier, cheveux rebelles, légère asymétrie, plis des vêtements, mise au point imparfaite, léger flou de mouvement, grain haut ISO, aucune retouche beauté). Critères de rejet : peau lisse, dents trop régulières, regard vers l'objectif, texte lisible, mains douteuses.

## Les sept sujets

| # | Format | Sujet | Fichier |
|---|---|---|---|
| 1 | PTH Originals | Opérateur caméra vu de trois quarts dos, casque, main sur la bague de mise au point, plateau sombre, contre-jour rouge | `originals.webp` |
| 2 | Films & séries | Une personne seule au 3ᵉ rang d'une salle vide, de profil, joue éclairée par le faisceau du projecteur | `films-series.webp` |
| 3 | Documentaires | Cinéaste de profil, caméra à l'épaule, filme une personne âgée sur son seuil, crépuscule, asphalte mouillé | `documentaires.webp` |
| 4 | Témoignages | Cadrage sous les yeux : lèvres entrouvertes, col de lin avec micro-cravate, une main qui geste, flou | `temoignages.webp` |
| 5 | Podcasts | Deux personnes en conversation de profil, l'une gesticule, l'autre sourit, micro sur perche, lampe chaude | `podcasts.webp` |
| 6 | Créateurs | Jeune créateur qui monte de nuit, de trois quarts, visage éclairé par un écran illisible, café, carnet | `createurs.webp` |
| 7 | Divertissement | Amis pris en plein rire autour d'une table, ampoules chaudes, visages doux, bokeh ambre et rouge | `divertissement.webp` |

## Conseils de génération

1. Une conversation neuve **par image**, prompt collé tel quel ; générer 2-3 variantes et garder la plus sobre.
2. Refuser toute variante avec du texte visible, un regard direct vers l'objectif, une peau lisse, des mains douteuses, un symbole religieux ou une teinte bleutée. **3 à 4 variantes par sujet** ; les mains et les yeux sont là où l'IA se trahit. Des **vraies photos de tournage** valent toujours mieux (surtout pour 4, 5 et 7).
3. Ne pas retoucher les couleurs à la main : **je passerai les 7 images dans un même étalonnage** (comme pour le plateau de la Hero, `scripts/grade-hero.mjs`) pour qu'elles forment une seule famille.

## Branchement (quand les fichiers arrivent)

1. Déposer les fichiers (chemin de téléchargement suffit) : je les convertis en WebP, recadre (4:5 et 16:10), étalonne et les place dans `public/media/formats/`.
2. Dans `src/content/fr.js`, `formats.items[i].image` = `"/media/formats/<fichier>.webp"` (aujourd'hui `null` = placeholder « Aperçu à venir »).
3. Ajouter un `alt` par visuel si nécessaire (les cadres sont décoratifs, `aria-hidden` : le sens est porté par le texte de la ligne).

## État (2026-09-26)
**Les 7 visuels sont reçus et intégrés** (+ portrait Mission) — 2026-09-26.
