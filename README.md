# Landing page PTH — Partage Ton Histoire

Site institutionnel immersif de PTH (Next.js 16, JavaScript, GSAP, Tailwind v4) : un film en 15 scènes, un formulaire
de participation (email + base de données), des dons en ligne, un espace admin.

- **Démarrer** : `npm install` puis `npm run dev` → http://localhost:3000
- **Vérifier** : `npm run lint` · `npm test` (22 tests) · `npm run build` · `node tests/integration.manual.mjs` (38 vérifications HTTP, tout local)
- **Comprendre le projet** : [`AGENTS.md`](AGENTS.md) (règles, pièges connus) puis le dossier [`docs/`](docs/)
- **Où en est-on** : [`docs/09-roadmap.md`](docs/09-roadmap.md) (journal de toutes les décisions)
- **Modifier les textes** : [`src/content/fr.js`](src/content/fr.js) · emails : [`src/content/emails.js`](src/content/emails.js)
- **Mettre en ligne** : [`docs/16-mise-en-ligne.md`](docs/16-mise-en-ligne.md) · **back-end et comptes à ouvrir** : [`docs/19-backend.md`](docs/19-backend.md)
- **Tester sur téléphone / navigateur** : [`docs/14-test-utilisateur.md`](docs/14-test-utilisateur.md) (ajouter `?diag` à l'adresse pour un panneau de diagnostic)

## Structure
Voir [`docs/07-tech-architecture.md`](docs/07-tech-architecture.md) (arborescence complète et flux).

```
docs/                 Brief, UX, DA, motion, design system, architecture, roadmap, QA, back-end, mise en ligne
src/app/              Routes Next.js (page, API, admin, merci, SEO, pages légales)
src/components/       layout · sections (une par scène) · hero · form · admin · ui
src/content/          Toute la copie (site + emails)
src/lib/              gsap, animations, forms (zod), server (emails, base, paiement, admin)
public/media/         Photos, vidéos, pastilles ; public/brand/ : logo
supabase/migrations/  Schéma SQL à coller dans Supabase
tests/                Tests unitaires + intégration
```

## Variables d'environnement
Modèle : [`.env.example`](.env.example). Jamais de clé dans le code, git ou une conversation.
