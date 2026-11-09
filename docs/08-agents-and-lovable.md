# 08 — Travailler avec plusieurs agents (dont Lovable)

## Ce dossier est agent-agnostique
- `AGENTS.md` = point d'entrée universel (Claude Code, Cursor, Codex, Copilot…). `CLAUDE.md` l'importe.
- Toute décision et tout avancement se notent dans `docs/09-roadmap.md` (journal de décisions) pour que n'importe quel agent reprenne sans contexte oral.
- Convention : un agent qui termine un travail met à jour la roadmap (état ✅/⏳, décisions, questions ouvertes).

## Lovable (connexion MCP prévue, pas encore active)
> Note : la demande vocale mentionnait « Babel » ; nous l'interprétons comme **Lovable**. À confirmer.

**Contrainte clé** : Lovable génère du **React + Vite + Tailwind + shadcn/ui** (TypeScript), pas du Next.js. Ses composants ne sont donc **pas** copiables tels quels : ils se *portent*.

### Répartition proposée
| Domaine | Qui | Pourquoi |
|---|---|---|
| Architecture, tokens, contenu, formulaire, API, SEO, perf, a11y, QA | **Claude Code** (ce repo) | Contrôle total, cohérence, back-end |
| Exploration visuelle rapide d'une section (variantes de composition, typographie, hero) | **Lovable** | Itération visuelle rapide, aperçu live |
| Back-end (email, Supabase, dons) | **Claude Code** (Next API routes) | Une seule source de vérité back |

### Protocole d'usage
1. **Brief à Lovable = une section à la fois**, avec : `docs/03-art-direction.md`, tokens (`tokens.css`), copie de la section (`fr.js`), références (`docs/references/`), et la consigne « composant présentationnel pur, données en props, pas de router, pas de back-end ». Passer les tokens en *project knowledge* (`set_project_knowledge`).
2. Récupération : `get_diff` / `read_file` (MCP Lovable) → **portage dans Next** : `.tsx` → `.jsx`, `<img>` → `next/image`, animations → GSAP via `lib/gsap.js`, couleurs → tokens, texte → `content/fr.js`.
3. **Ne jamais** brancher le back-end de Lovable au projet PTH : un seul Supabase (celui de PTH), géré ici. Lovable travaille avec des données mock.
4. Chaque échange consomme des **crédits** Lovable : cadrer les prompts, utiliser `plan_mode` pour discuter avant de générer.
5. Décision d'usage à trancher avec l'utilisateur : Lovable comme *laboratoire visuel jetable* (recommandé) ou comme *source de vérité front* (déconseillé : incompatible Next.js et stack JS).

### Quand appeler Lovable
- Explorer 2-3 variantes de la composition du Hero ou de la séquence Origin.
- Prototyper l'interface Origin (TV / desktop / mobile) pour les maquettes de la section 05 — **c'est son meilleur cas d'usage** : les écrans Origin sont des UI d'app en React/Tailwind.
- Pas pour : formulaire, API, GSAP complexe, SEO, perf.

## Autres agents
- Cursor/Codex : lire `AGENTS.md`. Respecter les règles non négociables.
- Figma : le MCP Figma est disponible ; la DA pourra y être posée si l'utilisateur le souhaite (non requis).
