# 04 — Motion system

**Principe** : le scroll est une caméra. Chaque animation raconte quelque chose ; sinon, on la supprime. Lente, élégante, naturelle. Jamais de scroll hijacking, jamais de blocage de navigation.

## Règles techniques
- Un seul moteur : **GSAP + ScrollTrigger**, importé depuis `@/lib/gsap`. Framer Motion : non installé (ajouter seulement si un besoin UI simple le justifie). **Lenis** : non installé — à évaluer seulement si l'inertie améliore réellement l'expérience.
- Toujours passer par `whenMotionOK()` (tout) ou `whenDesktopMotionOK()` (parallax, sticky, effets lourds) de `src/lib/animations.js`.
- Le contenu est **toujours visible sans animation** (reduced-motion, JS coupé, lecteur d'écran).
- N'animer que `transform` et `opacity` (GPU). Pas d'animation de layout.
- Tokens : `expo.out` (cine), `power2.inOut` (slow) ; durées 0.2 / 0.6 / 1.2 / 1.8 s.

## Catalogue
| ID | Élément | Trigger | Effet | Durée / easing | Mobile | Reduced-motion | État |
|---|---|---|---|---|---|---|---|
| H0 | Hero — timeline en 4 temps | scroll (pin 480 % desktop / 360 % mobile, scrub 0,6) | 20 unités : question → silence → réponse → lumière → révélation | `src/components/hero/heroTimeline.js` | pin + scrub aussi | état final direct | ✅ |
| H1 | I — la question | 0,5 → 5,8 | noir pur ; sous-titre de cinéma **mot par mot** (flou → net, stagger .24), palier de lecture 3,3-5,0, puis fondu | .6 / power2.out | idem (2 lignes) | non affichée (sr-only) | ✅ |
| H2 | Le silence | 5,8 → 6,6 | noir complet | — | idem | — | ✅ |
| H3 | II — la réponse | 6,6 → 10,6 | « **Oui !** » (mots forts d'abord) puis « Et on veut le montrer. » mot par mot ; palier ; fondu | .6 | idem | non affichée (sr-only) | ✅ |
| H4 | III — bandes cinémascope | 10,6 | scaleY 1 → 0 (top/bottom) ; `LETTERBOX` dans heroConfig | 1,3 | idem | absentes | ✅ |
| H5 | III — projecteurs | 10,8 → 12,9 | cascade depuis le centre (b1, b2, b0, b3), vacillement unique ; puis écran caméra, côtés (traînée anamorphique une fois, à gauche), sol, brume | 1,1 | idem | visibles | ✅ |
| H6 | III — voile | 10,8 → 17,2 | 1 → .55 → 0 | power1 | idem | — | ✅ |
| H7 | IV — mot TÉMOIGNAGE | 13,8 → 18 | .14 → .42 → .95 | — | idem | visible | ✅ |
| H8 | IV — manifeste, sous-texte, boutons, header | 16,4 → 19,1 | masque de ligne, fondu + montée | power3.out | idem | visibles | ✅ |
| H9 | Avancée caméra | 0 → 20 | scale 1 → 1,045 | none | idem | — | ✅ |
| H10 | Sortie | permanent | dissolution du bas de la scène dans le noir (`bottomFade`) + vignette | — | idem | idem | ✅ |
| S1 | Énoncé — remplissage des mots | scroll dans la section (sticky, 260 % desktop / 230 % mobile, scrub .5) | chaque mot : blanc estompé (35 %) → rouge plein, de gauche à droite ; palier final 0,9 → 1 | none | idem | phrase directement en rouge | ✅ |
| S2 | Énoncé — lueur rouge | 0,15 → 0,65 | opacité 0 → 1 (la lumière qui s'allume avec le texte) | none | idem | lueur discrète fixe | ✅ |
| S3 | Énoncé — parallaxe | toute la traversée | bloc de texte ±10 % et lueur ±18 % en sens opposé | none | **désactivée** | désactivée | ✅ |
| M7 | RevealText (slogan, mission, Origin) | entrée viewport (85 %) | mots masqués montent | 1.2 s, stagger .045 | idem | visible | ✅ |
| M8 | Mission scène 4 — disciplines | continu | défilement horizontal (CSS) | 40 s linéaire | idem | figé | ✅ |
| M9 | Mission scènes 1-3 — sticky | scroll | scène épinglée, image qui se révèle par masque | scrub | empilement simple | sans pin | ⏳ après portraits |
| M10 | Chiffres — 200K+ | entrée viewport | compteur 0 → valeur | 2 s power2.out | idem | valeur finale | ⏳ après chiffres réels |
| M11 | Origin — séquence | scroll pinné | question → pause → ORIGIN → TV → desktop → mobile | scrub | un appareil à la fois | statique | ⏳ après maquettes |
| M12 | Transition noir → rouge | scroll | fond qui glisse noir → bordeaux | scrub | simplifié | fond fixe | ⏳ |
| M13 | Formulaire — apparition des champs | choix du mode | fondu | 0.6 s | idem | direct | ⏳ |

## Ambition et Origin — principes
- **Ambition** (`Ambition.jsx`) : sticky 400 % ; 44 points de lumière convergent vers le centre (x/y calculés au refresh : `invalidateOnRefresh`), fondu dans la lueur, la réponse naît. Positions déterministes (PRNG à graine) : pas de décalage d'hydratation.
- **Origin** (`Origin.jsx`) : sticky 340 % ; ligne (scaleX) → écran (clip-path inset) → ORIGIN (background-position, balayage) → sous-titre mot par mot. Scène 2 : `ScrollFillText`, bandeau CSS (`.marquee-track`), `RevealText`.
- Débug : `window.__pthAmbition`, `window.__pthOrigin` avec `?debug`.

## Énoncé — principes
- **Sticky CSS** (pas de pin GSAP) : la section est plus haute que l'écran, son contenu reste collé ; ScrollTrigger lit la progression `top top → bottom bottom`. Plus simple et sans bloc ajouté par GSAP.
- Réglages dans `src/components/statement/statementConfig.js` : `FILL` ("red" | "ivory"), `DIM_ALPHA` (opacité de départ), `SECTION_HEIGHT`.
- Le DOM par défaut = état final (couleur pleine). `data-motion="pending"` affiche l'état estompé avant l'hydratation.
- Debug : `/?debug` désactive le scroll et expose la timeline sur `window.__pthStatement` (dev uniquement).

## Hero — principes d'architecture
- Le DOM par défaut = **état final** (reduced-motion, sans JS). `data-motion="pending"` affiche l'état « éteint » avant hydratation (évite un flash), `"on"` = GSAP actif, `"off"` = reduced-motion.
- Le cadre `.frame` reproduit `object-fit: cover` ; tous les calques sont en % du cadre (voir `hero.module.css`).
- Les lumières sont des copies de l'image visibles à travers un **masque statique** ; seule l'opacité est animée.
- **Debug** : `/?debug` → curseur de progression + boutons 00, Q1, Q2, Q3, A1, A2, L1, L2, R1, R2, 99 (un par plan).
- **Étalonnage** : `scripts/grade-hero.mjs` (courbe en S autour d'un pivot sombre, +10 % par défaut) lit `assets-src/hero-stage.source.webp` et écrit `public/media/images/hero-stage.webp`. Jamais de filtre CSS `contrast()` sur l'image animée.
- **Sortie** : pas de fondu au noir en fin de timeline (un visiteur qui s'arrête à la fin du pin verrait un écran noir sans boutons) ; la dissolution du bas est permanente.

## Vidéo
Hero : boucle muette courte (≤ 8 s, ≤ 2 Mo cible), WebM + MP4, `poster` obligatoire, `preload="metadata"`, pas d'autoplay si `prefers-reduced-motion` ou économie de données.


## Animations de texte — versions bureau / mobile (2026-09-26)
| Effet | Bureau | Mobile (≤ 767 px) |
|---|---|---|
| Remplissage (`ScrollFillText`, Énoncé) | opacité 0,35 → 1, mot après mot | opacité 0,25 → 1 **+ montée de 22–26 %** |
| Surlignage des mots forts | — | **supprimé (2026-09-27)** : couleur d'accent seulement, aucun soulignement |
| Apparition des titres (`data-reveal`, `PageMotion`) | montée + mise au point (flou) | **rideau** (`clip-path`) + montée, sans flou |
| Apparition des paragraphes | montée + mise au point | montée + fondu |
Règle : sur mobile, jamais de flou animé ni de `mix-blend-mode` plein écran (fluidité) ; on compense par des effets à base de transform / opacité / clip-path.

**« Mise au point » cinématographique (mobile, prop `cine`, `src/lib/cine.js`)** : utilisée sur « Qui sommes-nous ». Mot par mot : opacité 0 → 1, flou 7-10 px → 0, montée 20 px → 0, une seule fois par bloc (`once`, départ à 88 %). Aucun soulignement (supprimé à la demande). Le flou reste limité aux mots (petites surfaces) et est retiré à la fin (`clearProps`).

**Mobile, autres effets (2026-09-27, `PageMotion`)** : `data-media` = photo développée (rideau + zoom qui se pose + parallaxe) ; `data-focus` = liste « générique » (élément central allumé, à venir 0,22, passé 0,55) ; `.form-rise` = champs du formulaire en cascade. Tous transform / opacité / clip-path.
