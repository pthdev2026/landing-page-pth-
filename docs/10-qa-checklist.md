# 10 — Checklist QA

## Test des 10 secondes (brief §50)
- [ ] PTH est compris en moins de 10 secondes.
- [ ] Le Hero donne une sensation de média premium, pas d'association.
- [ ] La mission est claire ; la place de Jésus est claire ; accessible à un non-chrétien.
- [ ] Aucun cliché religieux graphique ; DA cohérente.
- [ ] Les textes sont simples et ont de la profondeur.
- [ ] Les chiffres servent de preuve (et sont **réels**).
- [ ] Origin est compris, et la différence PTH / Origin aussi.
- [ ] On sait comment investir, donner, devenir bénévole.
- [ ] Les animations renforcent le récit ; le site reste rapide ; l'envie de participer est là.

## Responsive
- [ ] 375 · 390 · 430 px (mobile) · 768 (tablette) · 1280 · 1440 · 1920.
- [ ] Titres monumentaux recadrés sans débordement horizontal de page.
- [ ] CTA accessibles au pouce ; menu mobile ; pas de scroll horizontal complexe.

## Accessibilité
- [ ] Contraste AA (attention aux mots atténués `ivory/25–35` : décoratifs uniquement).
- [ ] Navigation clavier complète ; focus visible ; menu et formulaire au clavier.
- [ ] `prefers-reduced-motion` : tout est visible, rien ne bouge.
- [ ] Un seul `<h1>` ; hiérarchie h2/h3 ; landmarks (`header`, `main`, `footer`, `nav`).
- [ ] Formulaire : labels, erreurs annoncées (`role="alert"`), `aria-invalid`.
- [ ] Alt text sur toutes les images réelles.

## Formulaire
- [ ] 4 modes : champs corrects, validation, message de succès/erreur.
- [ ] Honeypot ignoré silencieusement ; rate-limit ; email reçu en vrai (Resend configuré).
- [ ] CTA « Être bénévole » / « Investir » / « Donner » présélectionnent le bon mode.

## Performance
- [ ] Lighthouse mobile ≥ 90 (perf) / 100 (a11y, SEO, best practices) visés.
- [ ] LCP, CLS, INP dans les budgets (`07`).
- [ ] Vidéo hero légère + poster ; images optimisées ; 4 polices max.

## Navigateurs
- [ ] Safari (iOS + macOS) · Chrome · Firefox.

## Avant publication
- [ ] Chiffres vérifiés · liens sociaux · textes légaux · OG image · analytics · domaine + SPF/DKIM · `NEXT_PUBLIC_SITE_URL`.
