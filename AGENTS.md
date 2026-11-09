# AGENTS.md — Landing page PTH (point d'entrée pour tout agent)

> Lis ce fichier en premier, puis `docs/09-roadmap.md` (état d'avancement et décisions). Compatible Claude Code, Cursor, Codex, Lovable, Copilot, etc.
> Langue de travail avec l'utilisateur : **français**.

## Le projet en 5 lignes
- **PTH — Partage Ton Histoire** : média chrétien contemporain centré sur les témoignages.
- Ce site = **manifeste immersif + pitch deck + outil de conversion** (bénévoles, donateurs, partenaires, investisseurs). Ni site d'église, ni landing SaaS, ni la plateforme Origin.
- Vision (H1) : « Répondre aux enjeux de notre temps par le témoignage. »
- **PTH ≠ Origin** : PTH = média/vision ; Origin = plateforme de streaming *en développement*.
- Principe : **une scène = une idée**, le scroll est une caméra. Moins d'éléments, plus de présence.

## Stack
Next.js 16 (App Router) · **JavaScript** (pas TypeScript) · React 19 · Tailwind CSS v4 (tokens dans `src/styles/tokens.css`) · GSAP + ScrollTrigger · React Hook Form + Zod · Resend (email) · Supabase (prévu, non branché).

## Commandes
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # doit passer avant tout commit
npm run lint     # doit être propre
```
Variables d'environnement : copier `.env.example` vers `.env.local`.

## Où modifier quoi
| Je veux… | Fichier |
|---|---|
| Changer un texte | `src/content/fr.js` (jamais de texte en dur dans les composants) |
| Changer couleur / typo / espacement / durée | `src/styles/tokens.css` |
| Modifier une section | `src/components/sections/<Section>.jsx` |
| Ajouter un champ de formulaire | `src/lib/forms/fields.js` **+** `src/lib/forms/schemas.js` |
| Modifier l'envoi d'email / les textes des emails | `src/lib/server/emails.js` + `src/content/emails.js` |
| Modifier le traitement d'une demande | `src/app/api/participate/route.js` (+ `src/lib/server/*`) — voir `docs/19-backend.md` |
| Ajouter une animation | `src/lib/animations.js` (helpers) + le composant concerné ; documenter dans `docs/04-motion-system.md` |
| Réglages de la Hero (durée, longueur du scroll, bandes) | `src/components/hero/heroConfig.js` |
| Réglages de l'Énoncé (couleur de remplissage, opacité, hauteur) | `src/components/statement/statementConfig.js` |
| Retoucher l'étalonnage de l'image Hero | `node scripts/grade-hero.mjs 0.10 [--src=…]` (source : `assets-src/`, voir `docs/15`) |
| Ajouter un média | `public/media/{images,video,audio,origin}` puis l'utiliser via `<MediaFrame src=… />` |

## Pièges connus (à ne jamais réintroduire)
- **Jamais `overflow-x: hidden` (ni `overflow: hidden`) sur `html`, `body` ou un ancêtre d'un élément `position: sticky`.** Sur Safari iPhone il fait de cet ancêtre un conteneur de défilement et **casse tous les `sticky`** : les scènes (Énoncé, Ambition, Origin, Maison, Formats, fin de film) défilent au lieu de rester en place, et le site paraît « sans animation » sur mobile. Utiliser `overflow-x: clip` (ne crée pas de conteneur). Invisible sous Chrome : à valider sur un vrai iPhone.
- **Dans une timeline GSAP imbriquée, jamais de `set()` d'état initial** (il est annulé quand la lecture remonte avant son début) : voir `docs/09-roadmap.md`.
- **Aucune clé/secret dans le code, git ou la conversation** : variables d'environnement seulement (`.env.example`) ; les logs ne contiennent jamais de données personnelles ; toute route qui écrit vérifie l'origine, la taille et valide avec zod.
- **`maplibre-gl` sous Turbopack** : la librairie crée son propre Web Worker en interne ; Turbopack ne le sert pas correctement en dev (« Worker failed to load », carte qui reste noire sans erreur claire). Contournement en place : `public/vendor/maplibre-gl-worker.js` + `maplibre-gl-shared.mjs` (copies statiques depuis `node_modules/maplibre-gl/dist/`, à recopier si la version change) + `setWorkerUrl(...)` avant `new Map(...)` (voir `src/components/ui/GlobeMap.jsx`). Piège lié : `maplibre-gl.css` force `.maplibregl-map { position: relative }` sur le conteneur — ne jamais lui opposer un `position: absolute` maison (perdant, hauteur 0 silencieuse) ; donner une hauteur explicite (`height: 100%` sur un parent à `aspect-ratio` défini) à la place.
- **Jamais de valeur chiffrée écrite en dur** dans un composant : toujours lue dans `src/content/fr.js`.

## Règles non négociables
1. **Ne pas coder de solution générique.** Pour toute nouvelle section : rôle narratif → idée dominante → UX → desktop → mobile → motion → *puis* implémentation.
2. **Si ça ressemble à un template, le supprimer.** Animation sans intention narrative → supprimer. Élément retirable sans perte de sens → retirer.
3. **Interdits** : cards arrondies en série, dégradés bleu/violet, icônes partout, glassmorphism, illustrations corporate, croix/colombes/mains jointes en prière/ciel divin (exception validée : le geste de la Hero — deux mains qui se saisissent, sobre et sans lumière céleste), banques d'images, scroll hijacking, curseur custom, effets 3D/particules gratuits.
4. **Accessibilité** : `prefers-reduced-motion` respecté (via `whenMotionOK`), contraste, clavier, focus visible, aucun contenu uniquement par animation, HTML sémantique, un seul `<h1>`.
5. **Performance** : pas de vidéo lourde (jamais de 4K en hero), poster + fallback, `next/image`, polices limitées (4), pas de librairie d'animation en double.
6. **Chiffres** : uniquement des valeurs réelles et vérifiées. Les placeholders sont marqués `pending: true` dans `src/content/fr.js`.
7. **Mobile = expérience propre** (375 / 390 / 430 px), pas un desktop réduit. CTA à portée du pouce.
8. **Validation avant code** : ne pas lancer de refonte majeure sans validation explicite de l'utilisateur. Voir `docs/09-roadmap.md`.

## Documentation
`docs/01-brief.md` (vision, audience, ton) · `02-ux-and-wireframes.md` · `03-art-direction.md` · `04-motion-system.md` · `05-design-system.md` · `06-copy.md` · `07-tech-architecture.md` · `08-agents-and-lovable.md` · `09-roadmap.md` · `10-qa-checklist.md` · `14-test-utilisateur.md` (test réel navigateur/iPhone) · `15-image-haute-resolution.md` · `16-mise-en-ligne.md` · `17-textes-legaux-brouillon.md` · `18-prompts-formats.md` · `19-backend.md` (back-end, comptes, sécurité, tests) · références visuelles dans `docs/references/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
