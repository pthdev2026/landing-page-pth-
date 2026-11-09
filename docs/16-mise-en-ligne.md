# 16 — Mise en ligne : guide et check-list

Rien n'est publié tant que tu ne l'as pas décidé. Ce guide dit **quoi préparer**, **quoi faire dans quel ordre** et **comment vérifier**.

## 0. Bloquants (à me fournir / à décider avant de publier)

| # | Quoi | Pourquoi | Où ça se règle |
|---|---|---|---|
| 1 | **Adresse qui reçoit les formulaires** (`PTH_CONTACT_EMAIL`) | Sans elle, aucune demande n'arrive | variable d'environnement |
| 2 | **Clé Resend** (`RESEND_API_KEY`) + domaine d'envoi vérifié | Envoi réel des emails | resend.com (compte à ouvrir par toi) |
| 3 | **Textes légaux** (mentions légales, confidentialité) | Obligatoires en France dès qu'on collecte des données (formulaire) | brouillon : `docs/17-textes-legaux-brouillon.md` |
| 4 | **Nom de domaine** définitif | `NEXT_PUBLIC_SITE_URL`, SEO, image de partage, email | achat/DNS chez toi |
| 5 | **Lien TikTok** | Le lien du pied de page est masqué sans lui | `src/content/fr.js` (`footer.socials`) |
| 6 | **Fournisseur de dons** | Le mode « Faire un don » n'encaisse rien pour l'instant : c'est un formulaire de contact | à décider (Stripe, HelloAsso…) |
| 7 | **Analytics** (Plausible, GA4, PostHog…) | Mesurer les conversions ; `track()` est déjà branché dans le code | `src/lib/analytics.js` + bandeau cookies si GA/PostHog |

## 1. Variables d'environnement (à saisir chez l'hébergeur, jamais dans le code)

```
NEXT_PUBLIC_SITE_URL=https://ton-domaine.fr
RESEND_API_KEY=re_...
PTH_CONTACT_EMAIL=adresse-de-reception@...
PTH_FROM_EMAIL=contact@ton-domaine.fr        # domaine vérifié chez Resend
NEXT_PUBLIC_ANALYTICS_DOMAIN=ton-domaine.fr  # seulement si Plausible
```
Modèle : `.env.example`. Le fichier `.env.local` est ignoré par git.

## 2. Hébergement recommandé : Vercel (gratuit pour démarrer)

1. Mettre le projet sur un dépôt Git (GitHub). *Aucun commit n'a encore été fait : dis-moi quand tu veux que je prépare le premier.*
2. Vercel ▸ *Add New Project* ▸ importer le dépôt (framework détecté : Next.js, aucune config).
3. Saisir les variables du §1 (Environment Variables).
4. Déployer → une URL `*.vercel.app` de prévisualisation. **Tester dessus avant de brancher le domaine.**
5. *Settings ▸ Domains* : ajouter le domaine, suivre les enregistrements DNS demandés.

## 3. Email : Resend (SPF / DKIM)

1. Resend ▸ *Domains* ▸ ajouter ton domaine → il fournit 3-4 enregistrements DNS (SPF, DKIM, MX de retour).
2. Les ajouter chez ton registrar, attendre « Verified ».
3. `PTH_FROM_EMAIL` = une adresse de ce domaine (ex. `contact@…`).
4. Ajouter un enregistrement **DMARC** (`_dmarc`, `v=DMARC1; p=none; rua=mailto:…`) pour la délivrabilité.
5. Test : envoyer le formulaire depuis le site en production → l'email doit arriver **hors spam**.

## 4. Vérifications après le premier déploiement (10 min)

- [ ] Page d'accueil chargée, intro OK, aucune erreur console.
- [ ] `/robots.txt`, `/sitemap.xml` répondent et contiennent le bon domaine.
- [ ] Partage du lien dans WhatsApp / LinkedIn / X : image de prévisualisation avec le logo.
- [ ] Envoi de chaque mode du formulaire (6) : email reçu, contenu correct.
- [ ] Mentions légales et confidentialité **remplies** (plus de « Contenu à compléter »).
- [ ] Liens Instagram / YouTube corrects ; TikTok si fourni.
- [ ] Lighthouse mobile (Chrome ▸ DevTools ▸ Lighthouse) : performance ≥ 90, accessibilité / SEO / bonnes pratiques ≈ 100.
- [ ] Test iPhone Safari réel (scroll, Formats collants, vidéo d'Origin) : voir `docs/14-test-utilisateur.md`.

## 5. Déjà fait côté site

- En-têtes de sécurité (`next.config.mjs`) : `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`. Pas de CSP (scripts en ligne du site) : à revoir si un tiers est ajouté.
- Cache des médias (`/media`, `/brand`) : 1 semaine + revalidation.
- Formulaire : validation côté serveur (zod), champ piège anti-robots, limitation de fréquence.
- SEO : titre, description, Open Graph, Twitter, JSON-LD (Organization avec logo et réseaux), sitemap, robots, icône.
- Poids mesuré (production locale) : ≈ 604 Ko au chargement de la Hero (JS 301 Ko avant compression, CSS 14 Ko, images 144 Ko, polices 144 Ko), aucun décalage de mise en page (CLS = 0).

## 6. Après la mise en ligne (idées, dans l'ordre)

1. Image du plateau en haute résolution (`docs/15-image-haute-resolution.md`).
2. Stockage des demandes dans une base (Supabase) en plus de l'email.
3. Paiement des dons.
4. Page Origin dédiée / liste d'attente.
