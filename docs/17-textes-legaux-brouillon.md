# 17 — Textes légaux : brouillon à compléter (⚠ à faire relire avant publication)

> Ce document est un **modèle de travail**, pas un conseil juridique. Les champs `[EN CROCHETS]` sont à remplir avec tes informations réelles. Il faut le faire relire par une personne compétente (avocat, expert-comptable, juriste de l'association) avant de le mettre sur le site. Les pages actuelles (`src/app/(legal)/…`) affichent « Contenu à compléter » : rien de ce brouillon n'est publié.

## Informations dont j'ai besoin pour remplir

1. Forme juridique de PTH : association loi 1901 ? SAS ? micro-entreprise ? autre ?
2. Nom légal complet, adresse du siège, numéro SIREN/RNA, adresse email de contact.
3. Nom du **directeur de la publication**.
4. **Hébergeur** (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA — si Vercel).
5. Durée de conservation souhaitée des demandes reçues.
6. Outil d'analyse choisi (et s'il dépose des cookies).
7. Prestataires qui reçoivent des données : Resend (email) ; paiement de dons (à définir).

---

## MENTIONS LÉGALES (modèle)

**Éditeur du site**
[NOM LÉGAL DE PTH], [FORME JURIDIQUE] au capital de [MONTANT, si société], [SIREN / RNA].
Siège : [ADRESSE COMPLÈTE]. Email : [EMAIL DE CONTACT].
Directeur de la publication : [NOM ET PRÉNOM].

**Hébergeur**
[NOM DE L'HÉBERGEUR], [ADRESSE], [SITE WEB].

**Propriété intellectuelle**
L'ensemble des contenus (textes, images, vidéos, logo, marques) est la propriété de [NOM LÉGAL DE PTH] ou de ses partenaires. Toute reproduction sans autorisation écrite est interdite.
Le nom « Origin » et le logo PTH sont [des marques déposées / en cours de dépôt / à préciser].

**Responsabilité**
[NOM LÉGAL DE PTH] s'efforce d'assurer l'exactitude des informations publiées mais ne peut garantir l'absence d'erreur. Le site peut contenir des liens vers des sites tiers dont il n'a pas la maîtrise.

**Droit applicable**
Droit français. En cas de litige, les tribunaux compétents sont ceux de [VILLE / RESSORT].

---

## POLITIQUE DE CONFIDENTIALITÉ (modèle RGPD)

**1. Responsable du traitement**
[NOM LÉGAL DE PTH], [ADRESSE], contact : [EMAIL DE CONTACT].

**2. Données collectées**
Via le formulaire « Comment souhaitez-vous participer ? » : prénom, nom, email, message, et selon le mode choisi (investir, faire un don, devenir bénévole, partenaire, membre, nous contacter) les informations que vous renseignez [LISTER LES CHAMPS RÉELS : voir `src/lib/forms/fields.js`].
Aucune autre donnée personnelle n'est collectée par le site [À ADAPTER si un outil d'analyse est ajouté].

**3. Finalités et bases légales**
- Répondre à votre demande (base : mesures précontractuelles / intérêt légitime).
- [Gérer les bénévoles / partenaires / membres : base à préciser.]
- [Statistiques de fréquentation anonymisées : intérêt légitime, ou consentement si cookies.]

**4. Destinataires**
Les données sont accessibles à l'équipe de [NOM LÉGAL DE PTH] et à nos prestataires techniques : Resend (envoi d'emails, États-Unis, [garanties : clauses contractuelles types]), [HÉBERGEUR], [PRESTATAIRE DE PAIEMENT si dons]. Elles ne sont ni vendues ni cédées.

**5. Durée de conservation**
[DURÉE, ex. 3 ans après le dernier contact] puis suppression ou anonymisation.

**6. Vos droits**
Accès, rectification, effacement, opposition, limitation, portabilité. Pour les exercer : [EMAIL DE CONTACT]. Vous pouvez aussi saisir la CNIL (cnil.fr).

**7. Cookies**
[Le site n'utilise pas de cookie de suivi. / Liste des cookies et consentement si un outil d'analyse en dépose.]

**8. Sécurité**
Connexion chiffrée (HTTPS), validation des formulaires côté serveur, accès restreint aux données.

**9. Mise à jour**
Dernière mise à jour : [DATE].

---

## Points d'attention (à discuter avec la personne qui relit)

- **Dons et reçus fiscaux** : le site ne collecte pas encore de paiement. Si l'organisation délivre des reçus fiscaux, il faut le statut adapté et des mentions dédiées.
- **Témoignages** : dès que des personnes apparaissent dans les contenus, prévoir autorisations de droit à l'image.
- **Données sensibles** : les témoignages de foi peuvent révéler des convictions religieuses (donnée sensible au sens du RGPD). Si le site en collecte, prévoir un consentement explicite.
- **Mineurs** : préciser si le formulaire s'adresse aux moins de 15 ans.
