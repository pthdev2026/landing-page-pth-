# 13 — Vidéo de la section Origin : prompts, specs, usages (2026-09-25)

**Statut (2026-09-25)** : ✅ **vidéo reçue et intégrée** (usage n°1 : fond de l'écran d'Origin). Voir `09-roadmap.md` § « Vidéo d'Origin intégrée ». Le reste de ce fichier documente les prompts utilisés et les autres usages possibles.

## Principe du prompt (repris de l'exemple « THE BRASS VEIL », adapté PTH)
Format + durée en tête · un monde nommé · palette fermée · vocabulaire de cinéma · verbes d'action précis · **un seul plan, un seul mouvement** · quand un effet a le droit d'apparaître · liste d'interdits. **Aucun texte/UI dans la vidéo** (le mot ORIGIN et tout le texte restent en code). Le centre du cadre reste sombre et calme : ORIGIN sera posé dessus.

## Prompt A — « Le faisceau » (recommandé : zéro visage, cohérent avec la Hero)
```text
Origin Screen Loop | An 8-second photorealistic cinematic loop for PTH: 35mm film look, 16:9, coal black, deep crimson and burnt amber; the empty projection room of a classic cinema, one projector beam cutting slowly through drifting haze toward a screen we never see. Locked-off camera with an almost imperceptible slow push-in. The light shifts very slowly from warm amber to deep crimson and back, the haze turns lazily inside the beam, faint film grain. A single brief projector flicker only in the first second, then steady and calm for the rest of the shot. Keep the centre of the frame dark, soft and low in detail, all the light on the upper and right side. No people, no text, no letters, no logo, no interface, no subtitles, no film-leader numbers, no glitter, no sparkles, no neon, no cartoon look, no camera shake, no fast motion, no cuts.
```

## Prompt B — « Les spectateurs » (plus humain ; silhouettes de dos, jamais de visages)
```text
Origin Screen Loop | An 8-second photorealistic cinematic loop for PTH: 35mm film look, 16:9, coal black, deep crimson and warm amber; a dark cinema seen from the last row, a few silhouettes of spectators seen strictly from behind (no faces, no facial detail) looking at a large screen whose light plays softly on their shoulders and on the red velvet seats. Locked-off camera with an almost imperceptible slow push-in. The screen light drifts slowly between warm amber and deep red, a thin veil of haze in the air, faint film grain, nobody moves except a slight natural breathing. Keep the centre of the frame dark and quiet. No faces, no text, no letters, no logo, no interface, no subtitles, no neon, no cartoon look, no camera shake, no fast motion, no cuts.

Negative: text, watermark, faces, close-up of faces, morphing people, extra limbs, camera shake, zoom, cuts, glitter.
```

## Prompt C — image de départ (image-to-video) : à générer d'abord si l'outil accepte une première image
```text
Photorealistic cinematic still, an empty classic cinema projection room seen from the seats, a single amber projector beam crossing thin haze, deep black surroundings with warm crimson reflections on red velvet seats, faint film grain, 16:9, low-key lighting, centre of the frame dark and quiet, no people, no text, no logo.
```
Astuce : générer 2-3 variantes ; garder celle où **rien ne bouge sauf la lumière et la brume** et où le centre reste sombre. Durée demandée 8-10 s (je couperai/boucle).

## Ce que je dois recevoir
- Fichier **MP4** (H.264), 1080p max, **8-10 s**, sans piste audio (ou peu importe : je la retire).
- Idéalement une **image fixe** (une frame) pour le poster.
- Je le recompresse (ajout de `ffmpeg-static` au projet) : cible **MP4 + WebM ≤ 4 Mo**, 1280×720, `poster.jpg`, boucle propre (fondu de raccord ou aller-retour). Chemins : `public/media/video/origin-loop.{mp4,webm}` + `public/media/images/origin-poster.jpg`.

## Trois façons de « jouer » la vidéo dans Origin (à choisir)
| # | Usage | Effet | Effort | Risque |
|---|---|---|---|---|
| 1 | **Fond de l'écran** (derrière ORIGIN) : boucle muette, assombrie par un dégradé pour que le mot reste lisible | Vivant, discret, très cinéma | Faible | Très faible |
| 2 | **Lue par le scroll** : la vidéo avance pendant que l'écran s'ouvre puis que le mot s'éclaire | Lien direct scroll ↔ lumière | Moyen (réencodage « toutes images clés ») | Fluidité sur mobile |
| 3 | **L'écran devient plein cadre** après le mot ORIGIN : la vidéo prend tout l'écran comme une bande-annonce, puis le contenu reprend | Moment fort (le « reveal » ultime) | Moyen | Poids, durée du scroll |
Recommandation : **1 maintenant** ; **3** comme évolution possible. Sur mobile / « réduire les animations » : image poster fixe (pas de vidéo).
