# 05 — Design system

Source de vérité : `src/styles/tokens.css` (Tailwind v4 `@theme`). Ne jamais coder de valeur en dur dans un composant.

## Tokens
| Famille | Tokens |
|---|---|
| Couleurs | `ink, ink-soft, ink-line, blood, crimson, terracotta, flare, champagne, ivory, ivory-dim` → classes `bg-ink`, `text-champagne`… |
| Typo | `--font-display / sans / serif / subtitle` ; échelle fluide `--text-micro, body, lead, title, headline, monument` (+ `--text-hero`) |
| Échelle (à 1280 px) | micro 12 · body 17 · **lead 20** · **title 30** · **headline 47** · **monument 15 % de l'écran** · hero 45 |
| Espacement | `--spacing-gutter` (marges latérales), `--spacing-section` (respiration entre sections) |
| Motion | `--ease-cine, --ease-slow`, `--duration-fast/base/slow/cine` (miroir de `lib/animations.js`) |
| Z-index | `backdrop 0 · content 10 · header 50 · overlay 60` |
| Rayons | angles droits partout (anti-« cards arrondies »), **sauf** les 2 boutons de la Hero (pilules `rounded-full`, variantes `signal` / `outline`) |
| Bordures | filets fins `ink-line` ; accent `champagne/40` |

## Primitives (`src/components/ui/`)
| Composant | Rôle |
|---|---|
| `SectionLabel` | Repère « 03 / NOTRE MISSION » + filet |
| `DisplayTitle` | Titre display ; `decorative` pour les mots d'architecture |
| `AnimatedWord` | Voix serif italique, soulignement optionnel |
| `RevealText` | Révélation mot à mot au scroll (client) |
| `MediaFrame` | Image / vidéo / placeholder explicite (`src`, `poster`, `label`, `aspect`) |
| `StatBlock` | Chiffre monumental + légende (`pending`) |
| `CTAButton` | Bouton ; `mode` → présélectionne le formulaire + analytics |
| `SectionTransition` | Pont noir ↔ bordeaux |

## Boutons
`signal` / `outline` (pilules, Hero) · `solid` (ivoire → champagne au hover) · `ghost` (filet → champagne) · `red` (crimson → flare). Hauteur min 48 px, majuscules, tracking large. Focus visible champagne 2 px.

## Utilitaires CSS (`base.css`)
`.grain` (texture film SVG inline) · `.monument` (mot d'architecture) · `.marquee-track` · `.underline-draw`.

## Historique de l'échelle typographique
2026-09-25 : l'utilisateur a jugé les textes « trop grands » pour une page web (« si tu es à 100 %, je passe à 50 »). Titres et grands titres ≈ ×0,5 ; textes d'appui ×0,75 (sous 18 px la lecture se dégrade) ; mots monumentaux décoratifs ≈ ×0,6 ; espacement entre sections ×0,7. La Hero n'a pas été modifiée (elle suit l'image finale validée). Énoncé : ~51 px desktop / 24 px mobile.

## Règles typographiques (depuis la passe Saki, 2026-09-25)
- **Titres : graisse 400, interlettrage −0,05 em, interligne ~1,1.** UI/libellés : 500. Pas de gras dans les titres.
- **Échelle** (desktop) : display Hero 45 · headline 47 · title 30 · lead 20 · body 15-16 · **small 14** · micro 12. Chiffres clés `--text-figure` (~52).
- **Un seul mot d'accent rouge par titre** : `**mot**` dans `fr.js` → `.text-accent`. Plus de serif italique.
- **Formes** : boutons = pilules ; cartes/cadres = `--radius-card` (20 px) ; filets fins pour les listes.
- **Attention Tailwind v4** : ne pas nommer un token avec un préfixe de son espace de noms (`--spacing-*`, `--text-*`, `--color-*`, `--font-*`, `--radius-*`…) si le suffixe recoupe une classe existante (`--spacing-block` a cassé `inline-block`). Les espacements de mise en page sont `--space-*`.
