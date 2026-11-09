# 14 — Liste de test « vrai navigateur » (≈ 15 min)

Objectif : valider ce que l'aperçu de développement ne peut pas jouer (scroll réel, vitesse, iPhone, Lighthouse).
Les cases sont à cocher ; en cas de doute, noter **section + appareil + ce qui est vu** (captures bienvenues).

## 0. Préparer

Tester sur la **version de production** (plus proche de la vraie vitesse que le mode développement).

```bash
cd "/Users/easycash/Desktop/landing page pth" && npm run build && npm start -- -H 0.0.0.0 -p 3200
```

- **Mac** : http://localhost:3200
- **iPhone** (même Wi-Fi que le Mac) : http://192.168.1.24:3200 (l'adresse peut changer : `ipconfig getifaddr en0`)
- Ne **pas** ajouter `?debug` (ce mode coupe le scroll).
- Navigateurs : Chrome (Mac) · Safari (Mac) · Safari (iPhone) · idéalement un Android.

## ⚠ Test prioritaire sur iPhone Safari (correctif `sticky`)
Le site paraissait « sans animation » sur téléphone. Cause corrigée : `overflow-x: hidden` sur le body cassait les scènes collantes sous Safari iPhone. **À vérifier en premier, sans `?debug` :**
- [ ] Énoncé, Ambition, Origin, Maison, fin de film : la scène **reste en place** (collée à l'écran) pendant que le texte se remplit / que l'animation avance. Si la scène défile avec la page, dis-le-moi.
- [ ] Formats : le cadre visuel reste collé en haut sous le menu.
- [ ] Titres et blocs : chacun **monte et se met au point** quand il entre dans l'écran.
- [ ] Si rien de tout ça ne se voit encore : note le modèle d'iPhone, le navigateur (Safari, Chrome…), et si « Réduire les animations » (Réglages ▸ Accessibilité ▸ Mouvement) ou le mode économie d'énergie est activé.

## 🔎 Diagnostic « les animations ont disparu » (Chrome sur Mac, fenêtre étroite)
1. Ouvrir **`http://localhost:3200/?diag`** (ou `http://192.168.1.24:3200/?diag`) dans le Chrome concerné, à la même largeur de fenêtre.
2. Un panneau vert apparaît **en bas à gauche**. Défiler jusqu'à une scène qui devrait rester collée (ex. Énoncé, Ambition), attendre 2 s.
3. **Prendre une capture du panneau** et me l'envoyer : il indique la largeur réelle, la barre de défilement, le décalage horizontal (`scrollX`), le mouvement réduit, la prise en charge de `overflow: clip`, si chaque scène est « COLLÉ » ou « PAS COLLÉ », et les erreurs JavaScript.

## ⚠ Retour mobile du 2026-09-26 — à re-tester sur iPhone
- [ ] **Fluidité** : le scroll de la Hero (surtout l'allumage de la salle et le travelling) est-il plus fluide qu'avant ? (les lumières ont été refaites en petites fenêtres : ≈ 8× moins de pixels à traiter)
- [ ] **Hero** : le titre, le paragraphe et les boutons respirent-ils assez ? La ligne « +3 M · 147 K » en bas est-elle bien cadrée (elle disparaît sur les petits écrans) ?
- [ ] **Logo** : plus de cercle, lisible sur le contenu quand on défile ?
- [ ] **Formats** (Podcasts…) : chaque ligne entre avec de l'animation, l'image en haut « respire » à chaque changement ; la **pellicule de 7 vignettes** sous l'image suit le scroll et un toucher saute au bon format ?
- [ ] **Énoncé** : les deux petites photos en pastille dans la phrase s'allument avec les mots ?
- [ ] **Menu** : le bouton rond (flèche) à droite de « Menu » mène au formulaire ?
- [ ] **Densité** : les marges (24 px sur les côtés) et l'espace entre les blocs te paraissent-ils épurés ?

## 1. Le film, section par section (au scroll, lentement puis vite)

| # | Section | À regarder |
|---|---|---|
| 1 | **Hero** | Noir (grain de pellicule vivant) → la question s'écrit **au centre** → silence → « OUI ! ET ON VEUT LE MONTRER. » au centre → « BIENVENUE CHEZ PTH » au centre → la salle s'allume, bandes cinémascope qui s'ouvrent → « TÉMOIGNAGE », titre, sous-texte, 2 boutons → le menu (et la fine barre d'avancement rouge) n'apparaît qu'à la fin. Mobile : « GLISSER » + capsule animée, centrés ; **segments « story » en haut, travelling latéral de la caméra sur le plateau à l'allumage, deux cartes de verre (+3 M / 147 K) à la fin** — à juger au pouce : le balayage est-il fluide, trop rapide, trop long ? **À noter : la longueur totale du scroll est-elle bonne maintenant (−12 %) ? la bienvenue reste-t-elle assez longtemps ? le grain se voit-il sans gêner ?** Retour tout en haut : la salle doit redevenir noire. |
| 2 | **Énoncé** | « Nous racontons des histoires… » se remplit mot à mot (estompé → plein). Lisible, pas trop rapide. |
| 3 | **Qui sommes-nous** | La définition se remplit au scroll ; le texte reste lisible en fin de course. |
| 4 | **Mission** | Phrase-mission + les 5 mots (Cinéma, Journalisme…) + cadre média. |
| 5 | **Chiffres** | 147 K · 19,1 K · 10,5 K · +3 M. Titre « …des **millions** de personnes ». Les compteurs ne dépassent pas les vraies valeurs. |
| 6 | **Ambition** | Section épinglée : question, puis phrase de vision. Durée du scroll : trop long / trop court ? |
| 7 | **Origin** | L'écran s'ouvre ; la **vidéo boucle sans à-coup** (sur iPhone aussi, sauf « Économie de données » ou « Réduire les animations » : image fixe). Pas de coupure au raccord. |
| 8 | **Promesse** | Bande claire (ivoire) : contraste, lisibilité, entrée/sortie franche assumée. |
| 9 | **Formats** | 7 lignes. Desktop : le visuel de droite change quand la ligne passe vers 60 % de l'écran. **Mobile : le cadre reste collé en haut sous le menu et change d'image pendant que les descriptions défilent dessous.** |
| 10 | **Maison** | La maison se dessine, la porte s'éclaire, la phrase arrive. Tient dans l'écran sur mobile. |
| 11 | **Pourquoi maintenant** | 3 cartes lisibles, pas de texte coupé. |
| 12 | **Soutenir** + 3 manières | Objectifs qui se remplissent ; 3 cartes (Investir · Donner · Bénévole), boutons OK. |
| 13 | **Membre** | Message centré, bouton fonctionnel. |
| 14 | **Contact** | Voir §3 (formulaire). |
| 15 | **Fin** | Salle qui s'éteint → phrase mot par mot → **logo PTH** + « Partage Ton Histoire » (le logo apparaît **après** la phrase, jamais avant que la salle soit noire). Puis pied de page. |

Ressenti global à noter : **rythme** (trop lent / trop rapide ?), **fatigue de scroll** (où ça traîne ?), **moments forts**, **moments où l'on décroche**.

## 2. Menu flottant

- [ ] Haut de page : logo seul, capsule au centre, pastille « Être bénévole » à droite.
- [ ] Dès qu'on défile : le logo prend une pastille sombre, rien ne chevauche mal le contenu.
- [ ] **Le lien actif change** avec la section (Vision → Mission → Origin → Nous soutenir) ; aucun lien actif à partir de Membre.
- [ ] Clic sur chaque lien : arrivée au bon endroit.
- [ ] **Mobile** : « Menu ⌄ » ouvre la carte (4 liens + 2 boutons), se ferme au clic sur un lien, se ferme avec « Fermer ».
- [ ] Le logo ramène en haut.
- [ ] Touche **Tab** : le premier arrêt est « Aller au contenu » (lien d'évitement), puis le menu ; le focus est visible.

## 3. Formulaire (section Contact)

- [ ] Boutons « Être bénévole », « Contact », etc. : le formulaire s'ouvre **sur le bon mode**.
- [ ] Champ vide → message d'erreur clair ; email invalide → erreur.
- [ ] Envoi valide → message de succès. (Sans clé Resend : rien n'arrive par email, la demande s'affiche seulement dans le terminal du serveur.)
- [ ] Sur iPhone : le clavier ne cache pas le bouton d'envoi ; pas de zoom automatique gênant.

## 4. Appareils

- [ ] **iPhone Safari** : pas de saut de barre d'adresse qui casse les sections épinglées ; pas de défilement horizontal ; le notch/la barre du bas ne masquent rien.
- [ ] **Mac Safari** : polices et dégradés d'argent des titres corrects (le dégradé est peint mot par mot).
- [ ] **Fenêtre étroite / très large** (Mac : redimensionner, ou écran externe 1920).
- [ ] **Réduire les animations** (Mac : Réglages ▸ Accessibilité ▸ Animation ; iPhone : Accessibilité ▸ Mouvement) : tout le texte est visible, rien ne bouge, l'intro Hero n'est pas affichée en sous-titres.

## 5. Vitesse (Lighthouse)

Chrome ▸ DevTools ▸ Lighthouse ▸ **Mobile** ▸ Performance + Accessibilité + SEO + Bonnes pratiques, sur `http://localhost:3200`.

Cibles : Performance ≥ 90 · Accessibilité, SEO, Bonnes pratiques ≈ 100. Noter les 4 scores et le LCP.
Sur le Mac uniquement : les chiffres de l'iPhone dépendent du Wi-Fi.

## 6. Partage et onglet

- [ ] Onglet du navigateur : icône PTH visible, titre « PTH — Partage Ton Histoire ».
- [ ] Partage du lien (nécessite une URL publique) : image de prévisualisation avec le logo. À refaire après mise en ligne.
- [ ] Pied de page : liens Instagram et YouTube s'ouvrent sur les bons comptes ; mentions légales et confidentialité s'ouvrent.

## 7. Quoi me renvoyer

Une ligne par problème : `Section — appareil/navigateur — ce que je vois — ce que j'attendais`.
Exemple : « Origin — iPhone Safari — la vidéo ne joue pas mais l'image reste, écran flou en bas — je pensais voir la boucle ».

Points déjà connus, inutile de les signaler : formulaire sans envoi d'email (clé Resend manquante), lien TikTok absent, image de partage à vérifier après mise en ligne, image du plateau en 1672 px (moins nette sur très grand écran).
