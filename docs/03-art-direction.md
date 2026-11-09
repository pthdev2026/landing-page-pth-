# 03 — Direction artistique

**Cocktail visuel** : affiche de cinéma + magazine éditorial contemporain + média culturel + expérience web immersive. Typographie monumentale, superpositions, espaces négatifs, lignes fines, micro-typographie, numérotation, profondeur, grain.

## Analyse des références (`docs/references/`)
| Réf | Ce qu'on retient | Ce qu'on ne copie pas |
|---|---|---|
| `ref-1` REDFLAG / Cirléur | Mot condensé géant rouge coupé aux bords, sur noir ; **titre gras blanc au centre** ; **calligraphie script en superposition** ; micro-textes aux 4 coins ; profondeur par superposition | Contenu, marque, palette 100 % rouge |
| `ref-4` SOON / Rebranding | Même principe, halo rouge lumineux qui « éclaire » le mot ; script en surimpression légère ; micro-texte centré en bas | — |
| `ref-2` VISUALS / Creative Studio | Mot géant en fond avec **halo de lumière** ; hiérarchie : petit surtitre → gros titre → script → micro-baseline ; croix « + » de repère | **Le bleu** (palette PTH = noir/rouge/champagne) |
| `ref-3` Qlixor (site) | Portrait humain plein cadre teinté rouge ; navigation verticale sur le côté ; **chiffres sobres** ; défilement de marques | Cards KPI, logos-clients, cyan (interdit par le brief : pas de SaaS/agence template) |

**Décision (2026-09-25)** : le script calligraphique des références n'est pas retenu pour l'instant (police retirée, jamais utilisée) ; la voix éditoriale reste la serif italique. À reconsidérer si un moment de signature le justifie.

## Couleurs
| Token | Valeur | Usage |
|---|---|---|
| `ink` | #050505 | Base dominante |
| `ink-soft` / `ink-line` | #0d0a0a / #241a1a | Surfaces, filets |
| `blood` | #4a0a10 | Bordeaux profond, fonds de scène |
| `crimson` | #8f1220 | Rouge identitaire |
| `terracotta` | #b4452f | Rouge chaud |
| `flare` | #ff3a24 | Rouge lumineux — **ponctuel** (impact, accent) |
| `champagne` | #d9b98a | Accent premium (repères, hover, serif) |
| `ivory` / `ivory-dim` | #f4efe6 / #b9b2a6 | Texte / respiration |

**Règle** : jamais un rouge uniforme sur toute la page. Le rouge = lumière, gradient, texture, typographie, accent, photo. Alterner noir profond et scènes bordeaux.

## Typographie (4 voix)
| Voix | Police | Usage |
|---|---|---|
| Display | **Anton** (condensée) | Mots monumentaux (TÉMOIGNAGE, MESSAGE, ORIGIN), chiffres, titres de scène |
| Titres | **Inter Tight** (700) | Manifeste, phrases fortes |
| Texte | **Inter Tight** (400) | Lecture, largeur limitée |
| Accent | **Instrument Serif** italique | Second timbre, rare |
| Sous-titres | **Archivo** (largeur 106 %, 300/700) | Intro de la Hero : question et réponse, majuscules, petit |

Alternatives possibles si la charte PTH impose autre chose : display *Bebas Neue / Big Shoulders / Druk (licence)*. **Charte fournie plus tard → remplacer dans `layout.js` + `tokens.css`.**

## Photographie
Documentaire / interview / cinéma / éditorial. Visages, regards, mains, imperfections, tournages, caméras, coulisses, silences. Pas de peau lissée, pas de poses corporate, pas d'IA évidente, pas de banque d'images. Traitement : teinte rouge/noir + grain cohérents ; jamais au détriment du réalisme.

## Interdits
Voir `AGENTS.md` §Règles. L'identité chrétienne vient du **message et des histoires**, pas d'un empilement de symboles.

## Univers visuel retenu (2026-09-25) — références « Visual UI » et « Saki »
**Le fond central** : dégradés **rouge profond → noir**, avec une **pointe d'orangé** (terracotta), des **polices simples et digitales**, du **gris**. Retenue avant tout : lueurs sourdes, jamais un aplat rouge.
- **Titres** : Inter Tight medium, dégradé **argenté** (`--gradient-silver`) sur fond sombre, **métal sombre** (`--gradient-metal`) sur la bande claire.
- **Boutons** : pilule blanche au texte noir (principal), pilule sombre (secondaire).
- **Gris** neutres pour le texte secondaire (`--color-ivory-dim`).
- **Fonds** : classes `.atmo-*` (base.css), qui s'éteignent dans le noir sur leurs bords.
- **Hero** : inchangée (validée), sauf police du titre et boutons.
- Motif possible (non appliqué) : anneaux rouges lumineux concentriques de la référence Saki.
