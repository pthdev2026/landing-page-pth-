# 19 — Back-end : architecture, comptes à ouvrir, sécurité, tests

État (2026-10-13) : **tout est codé et testé avec des simulations** (53 tests unitaires + 38 vérifications d'intégration). Aucun compte réel n'est branché : chaque brique s'active dès que sa clé est saisie. Rien n'est publié.

**Décision d'architecture (2026-10-13)** : un brief technique détaillé demandait des **Supabase Edge Functions** (Deno/TypeScript) pour le module de dons Stripe. Après analyse (voir `docs/09-roadmap.md`), choix validé avec l'utilisateur : garder les **routes API Next.js** déjà en place (même garantie de sécurité — les secrets ne quittent jamais le serveur — testable immédiatement en local, sans Docker ni projet Supabase à créer avant de coder). Toutes les exigences du brief (validation stricte, clé d'idempotence, 3 tables, déduplication des webhooks, 8 types d'événements, tests) sont livrées dans cette architecture. ⚠️ Le brief imposait aussi 3 montants mensuels fixes avec Price ID créés à l'avance — assoupli le 2026-10-14 (demande utilisateur) en montant libre des deux côtés, voir « Dons, en détail » ci-dessous.

## Vue d'ensemble

```
Visiteur ──► formulaire (client) ──► POST /api/participate ─┬─► Supabase  (table leads)      ← demande enregistrée
                                                            ├─► Resend    (email à l'équipe)  ← Reply-To = le visiteur
                                                            └─► Resend    (confirmation au visiteur)
           ┌─ don en ligne ───────► POST /api/donate ───────┬─► Supabase  (donation_payments, statut « pending »)
           │  (UUID d'idempotence)                          └─► Stripe Checkout (prix calculé à la volée, ponctuel et mensuel)  ──► /merci?session_id=…
Stripe ────► POST /api/webhooks/stripe (signature vérifiée, événement dédupliqué) ─► Supabase
             (donation_payments = « paid »/« refunded »/… + donation_subscriptions + email de remerciement)
Équipe ────► /admin (mot de passe) : lire, filtrer, marquer « traité », exporter en CSV
```

Le don n'est **jamais** marqué payé par `/api/donate` (qui ne fait que démarrer le paiement) : seul le webhook, signature Stripe vérifiée, peut le confirmer.

Règle centrale : **une demande n'est jamais perdue**. Le succès = au moins UN canal a fonctionné (base OU email). Si les deux tombent : erreur claire au visiteur (502), jamais un faux « c'est envoyé ».

## Les briques (toutes derrière un adaptateur)

| Brique | Fichiers | Sans configuration | Configurée |
|---|---|---|---|
| **Demandes** | `src/lib/server/leads.js`, `supabase/migrations/0001_init.sql` | dev : fichiers `.data/*.jsonl` ; **production : aucun stockage** (email seul) | Supabase (API REST, clé serveur) |
| **Dons (paiements)** | `src/lib/server/stripe.js` + `leads.js`, `supabase/migrations/0002_donation_payments.sql`, `api/donate`, `api/webhooks/stripe`, page `/merci` | formulaire « laissez vos coordonnées » (pas de paiement en ligne) | Stripe (`donation_payments`, `donation_subscriptions`, `stripe_webhook_events`) ou lien HelloAsso |
| **Emails** | `src/lib/server/emails.js`, `src/content/emails.js` | dev : journal ; prod : erreur explicite | Resend : notification équipe + confirmation visiteur + remerciement de don |
| **Anti-robots** | `src/lib/server/turnstile.js`, `src/components/form/Turnstile.jsx` | désactivé (champ piège + limitation de débit restent actifs) | Cloudflare Turnstile invisible |
| **Admin** | `src/lib/server/admin.js`, `src/app/admin`, `api/admin/*` | **404 (n'existe pas)** | mot de passe + cookie signé 8 h |

**Dons, en détail** (brief technique du 2026-10-13, assoupli le 2026-10-14) :
- **Montant libre des deux côtés** — ponctuel ET mensuel, **10 € minimum**, pas de plafond commercial (plafond technique : 100 000 €) ; le navigateur suggère 10/50/100 € mais peut saisir autre chose, quel que soit le rythme. Le prix est créé **à la volée** par Stripe (`price_data`) dans les deux cas — pour le mensuel, avec `recurring: {interval: "month"}` — jamais via un Price ID créé à l'avance dans le Dashboard (le brief initial imposait 3 montants mensuels fixes avec Price ID ; assoupli le 2026-10-14 sur demande utilisateur).
- **Idempotence** : le navigateur génère un UUID v4 par tentative de paiement (réutilisé si la requête est relancée), transmis à Stripe comme clé d'idempotence ET utilisé comme `internal_reference` dans `donation_payments` (unique en base) — un double-clic ne crée jamais deux lignes ni deux Sessions.
- **3 tables** (`0002_donation_payments.sql`) : `donation_payments` (chaque paiement — ponctuel ou une mensualité), `donation_subscriptions` (état courant d'un abonnement), `stripe_webhook_events` (déduplication — un `event.id` Stripe n'est jamais traité deux fois). RLS fermée, comme `leads`/`donations`.
- **Webhook** : 8 événements gérés — `checkout.session.completed`, `.async_payment_succeeded`, `.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `.deleted`, `charge.refunded`.
- **Don fléché vers un projet** (page `/projets`, 2026-10-18) : `project` optionnel dans le formulaire — un slug (`"origin"`, `"pth"`…), jamais un identifiant Stripe. Revérifié par `/api/donate` contre le vrai catalogue (`src/content/projects.js`, `isValidProjectSlug`) avant d'être inscrit en métadonnée Stripe (`metadata.project`) et en base (`donation_payments.project`, colonne ajoutée par `0003_donation_project.sql`). Absent ou invalide → `"general"` (don PTH non fléché, comportement d'origine).

## Comptes à ouvrir (dans cet ordre) — je te guide à chaque étape

1. **Resend** (resend.com) : créer un compte ▸ *Domains* ▸ ajouter ton domaine (SPF/DKIM, voir `docs/16`) ▸ *API Keys* ▸ créer une clé → `RESEND_API_KEY`. Renseigner `PTH_CONTACT_EMAIL` (qui reçoit) et `PTH_FROM_EMAIL` (une adresse du domaine vérifié).
2. **Supabase** (supabase.com) : *New project* (région Europe) ▸ *SQL Editor* ▸ coller `supabase/migrations/0001_init.sql` ▸ *Run*, puis coller `supabase/migrations/0002_donation_payments.sql` ▸ *Run* (dans cet ordre) ▸ *Project Settings ▸ API* : copier **Project URL** → `SUPABASE_URL` et la clé **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠ jamais l'autre clé, jamais dans une variable `NEXT_PUBLIC_*`). Les tables sont fermées au public (RLS sans règle) : seul le serveur y accède.
3. **Cloudflare Turnstile** (dash.cloudflare.com ▸ Turnstile ▸ *Add site*, mode *Managed*) : clé de site → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, clé secrète → `TURNSTILE_SECRET_KEY`.
4. **Admin** : choisir un mot de passe long → `ADMIN_PASSWORD` ; `openssl rand -base64 32` → `ADMIN_SESSION_SECRET`.
5. **Dons** — choisir UN prestataire :
   - **HelloAsso** (recommandé si PTH est une **association** : 0 % de commission sur les dons, **reçus fiscaux automatiques**) : créer le formulaire de don chez eux, copier son lien → `HELLOASSO_DONATION_URL`, `DONATION_PROVIDER=helloasso`.
   - **Stripe** (si société ou si tu veux le paiement directement sur le site) : voir la procédure détaillée juste en dessous. `DONATION_PROVIDER=stripe`.
   - Dans les deux cas : `NEXT_PUBLIC_DONATIONS_ENABLED=true` (le choix du montant apparaît ; à redéployer car inscrit au build).
   - ⚠ Les **reçus fiscaux** ne sont pas générés par le site : HelloAsso les gère ; avec Stripe il faut un processus à part (statut d'organisme éligible requis) — voir « Reçus et fiscalité » plus bas.

Les clés se saisissent dans `.env.local` (local) ou dans les variables d'environnement de l'hébergeur — **jamais dans la conversation**. Après chaque changement de variable `NEXT_PUBLIC_*` : reconstruire (`npm run build`) / redéployer.

### Configuration Stripe — dons (mode Test d'abord, TOUJOURS)

Ne jamais mélanger les identifiants Test et Live : refaire CHAQUE étape une seconde fois en mode Live avant la mise en ligne, avec des variables d'environnement de production séparées.

1. **Compte** : stripe.com ▸ créer un compte ▸ rester en **mode Test** (bascule en haut à droite du Dashboard) pour tout ce qui suit.
2. **Clé secrète** : *Développeurs ▸ Clés API* ▸ copier la clé secrète (`sk_test_…`) → `STRIPE_SECRET_KEY`.
3. ~~Produit + prix mensuels fixes~~ — **plus nécessaire** depuis le 2026-10-14 : ponctuel et mensuel sont tous les deux calculés à la volée côté serveur (`price_data`, avec `recurring` pour le mensuel), rien à créer dans *Catalogue de produits*.
4. **Webhook de test** : *Développeurs ▸ Webhooks ▸ Ajouter un point de terminaison* ▸ URL `https://<domaine>/api/webhooks/stripe` (ou, en local, voir « Tester en local » ci-dessous) ▸ sélectionner les 8 événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded` ▸ copier le **secret de signature** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.
5. **Moyens de paiement** : *Paramètres ▸ Moyens de paiement* — carte activée par défaut ; Apple Pay / Google Pay s'activent automatiquement s'ils sont disponibles pour le visiteur. Laisser le SEPA désactivé pour l'instant (paiement différé : à activer seulement après avoir vérifié son comportement avec les événements asynchrones, déjà gérés par le webhook).
6. **E-mails de reçus Stripe** : *Paramètres ▸ Notifications aux clients* ▸ activer les reçus de paiement par e-mail. ⚠ Ce sont des reçus Stripe, pas des reçus fiscaux français (voir plus bas).
7. **Customer Portal** : *Paramètres ▸ Portail client* ▸ activer, autoriser « mettre à jour le moyen de paiement » et « annuler l'abonnement » (résiliation à la fin de la période déjà payée). Pas d'interface PTH à construire pour ça en V1 — le portail Stripe suffit.
8. **Personnalisation de la page Checkout** : *Paramètres ▸ Marque* ▸ logo PTH + couleurs (rouge `#8f1220`/`#b3232b`, fond sombre).
9. **Tester en local** (avant tout déploiement — voir brief §17) : installer le [CLI Stripe](https://stripe.com/docs/stripe-cli), puis :
   ```bash
   stripe listen --forward-to localhost:3100/api/webhooks/stripe
   ```
   Il affiche un `whsec_…` LOCAL (différent de celui du Dashboard) — l'utiliser dans `.env.local` pendant les tests. Faire un don de test avec la carte `4242 4242 4242 4242` (toute date future, CVC quelconque) et vérifier dans `/admin` que le don passe « pending » → « paid ».
10. **Passage en production** : repasser le Dashboard en mode **Live** (bascule en haut à droite), refaire les étapes 2 et 4 à 8 avec les clés Live (`sk_live_…`, nouveau webhook pointant vers le vrai domaine), les saisir dans les variables d'environnement de l'hébergeur (jamais dans `.env.local`, jamais dans un fichier versionné).

## Sécurité (ce qui est en place)

- **Validation** serveur (zod, mêmes schémas que le client), taille max 20 Ko, origine vérifiée (anti-CSRF), champ piège (faux succès pour les robots, testé avant la validation).
- **Limitation de débit** : 5 demandes / 10 min / visiteur — en mémoire ET dans la base (survit aux redémarrages) ; 5 essais de connexion admin / 10 min.
- **RGPD** : l'IP n'est jamais stockée, seulement une empreinte salée (SHA-256). Purge conseillée des demandes archivées > 3 ans (requête commentée dans le SQL).
- **Emails** : tout est échappé (aucun HTML injecté), sujets sur une ligne (pas d'injection d'en-têtes), version texte fournie.
- **Paiement** : aucune donnée de carte ne touche le site (page Stripe hébergée) ; un don n'est « payé » que par le **webhook signé** (HMAC vérifié, tolérance 5 min, **corps jamais lu avant la vérification de signature**, idempotent par `stripe_webhook_events.stripe_event_id`) ; montant borné 10–100 000 € des deux côtés (ponctuel ET mensuel), vérifié côté serveur quel que soit ce qu'envoie le navigateur ; clé d'idempotence Stripe sur chaque création de Session (pas de double paiement sur double-clic).
- **Admin** : absent (404) sans mot de passe ; cookie HttpOnly + SameSite=Strict + Secure ; comparaison en temps constant ; jeton signé avec expiration ; `noindex`, `no-store`, exclu de `robots.txt` ; export CSV protégé contre l'injection de formules.
- **Clés** : jamais dans le code ni côté navigateur (seules `NEXT_PUBLIC_*` le sont, et ce sont des clés publiques) — vérifié par un test automatisé qui relit le code du formulaire.
- **Méthodes HTTP** : seules `POST` (et `OPTIONS` en pré-vol navigateur) sont acceptées sur les routes de don — comportement par défaut de Next.js (toute autre méthode reçoit un 405 automatiquement, aucun code à écrire).

## Tester

```bash
npm test                              # 53 tests unitaires (sécurité, validation des dons, paiement, webhook, stockage local + Supabase simulé, emails, admin)
node tests/integration.manual.mjs     # 38 vérifications HTTP de bout en bout (faux Stripe, port 3300), tout est local et jeté
```
Aucun des deux ne contacte de vrai service. `tests/donations.test.mjs` couvre spécifiquement le module de dons (section « Tests obligatoires » du brief technique du 2026-10-13) : validation des montants (ponctuel/mensuel, décimales, bornes), création de Session (ponctuelle et mensuelle), double-clic sans doublon, chaque type d'événement webhook (dont la déduplication et le « pas de doublon sur la première mensualité »), et les points de sécurité (pas de clé dans le front-end, origine, taille, secret absent).

Pour un test de bout en bout avec de VRAIS événements Stripe (recommandé avant la mise en ligne) : voir « Tester en local » dans la section Stripe ci-dessus (`stripe listen` + CLI Stripe).

## Wording à valider (écrit par l'assistant, pas dans le brief)

Emails (`src/content/emails.js`), page `/merci` et micro-textes du don en ligne (`thanks`, `form.donateOnlineNotice`, `amountLabel`, `frequency*`, `donateSubmit` dans `fr.js`). À relire et adapter au ton de PTH.

## Reçus et fiscalité

Les e-mails de reçus Stripe (activés à l'étape 6 de la config Stripe) sont de simples reçus de paiement — **jamais présentés comme un reçu fiscal français** (pas de CERFA, pas de promesse de réduction d'impôt) tant que le statut juridique et fiscal de PTH n'est pas confirmé (association reconnue d'intérêt général, etc.). L'architecture (table `donation_payments`, montant/devise/donateur déjà enregistrés) permet d'ajouter un vrai système de reçus fiscaux plus tard sans tout refaire — non implémenté dans cette V1.

## Reste à faire côté projet (quand les comptes existent)

1. Saisir les clés, faire un **vrai envoi de test** de chaque mode, vérifier l'arrivée hors spam.
2. Stripe : suivre « Configuration Stripe — dons » ci-dessus (produit + 3 prix mensuels, webhook, Customer Portal, personnalisation Checkout), tester en mode Test avec `stripe listen` et la carte `4242 4242 4242 4242`, puis repasser en mode Live avec des identifiants Live séparés.
3. Prévoir une **sauvegarde** (Supabase propose des sauvegardes quotidiennes sur les offres payantes ; sinon export CSV régulier depuis `/admin`).
4. Textes légaux (`docs/17`) : ils doivent mentionner Supabase, Resend, Cloudflare et Stripe/HelloAsso comme sous-traitants.
5. Décider : éligibilité aux reçus fiscaux (voir « Reçus et fiscalité » ci-dessus) — question juridique, pas technique.
