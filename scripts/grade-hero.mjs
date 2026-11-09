/**
 * ÉTALONNAGE DE L'IMAGE DE LA HERO (colour grading, fait une seule fois, hors navigateur).
 *
 * Pourquoi ici et pas en CSS ? Un filtre CSS `contrast()` sur une image plein écran animée
 * est recalculé par le GPU à chaque image. Un étalonnage "cuit" dans le fichier ne coûte rien.
 *
 * La courbe : une courbe en S autour d'un pivot sombre (l'image est très sombre).
 *  - sous le pivot  : on creuse les ombres (noirs plus profonds, salle plus enveloppante)
 *  - au-dessus      : on relève très légèrement les hautes lumières (faisceaux, lampes)
 *
 * Usage : node scripts/grade-hero.mjs [contraste=0.10] [--src=fichier] [--out-dir=dossier]
 *   0.10 ≈ « +10 % de contraste »    0 = image d'origine
 *   --src      image NON étalonnée (défaut : assets-src/hero-stage.source.webp ; un PNG agrandi par un upscaler convient)
 *   --out-dir  dossier de sortie (défaut : public/media/images)
 * Sorties : hero-stage.webp (largeur max 3200) et, si la source est plus large que 2000 px,
 * hero-stage-md.webp (2000 px, pour mobile et tablette). Jamais d'agrandissement : on ne fabrique pas de pixels.
 */
import sharp from "sharp";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const contrast = Number(args.find((a) => !a.startsWith("--")) ?? 0.1);
const SRC = flag("src", "assets-src/hero-stage.source.webp");
const OUT_DIR = flag("out-dir", "public/media/images");
const PIVOT = 0.35;

const lut = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  const x = i / 255;
  const y =
    x < PIVOT
      ? PIVOT * Math.pow(x / PIVOT, 1 + contrast * 1.8)
      : 1 - (1 - PIVOT) * Math.pow((1 - x) / (1 - PIVOT), 1 + contrast * 0.6);
  lut[i] = Math.round(Math.min(1, Math.max(0, y)) * 255);
}

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i++) data[i] = lut[data[i]];

const graded = () => sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
const targets = [{ name: "hero-stage.webp", width: 3200 }];
if (info.width > 2000) targets.push({ name: "hero-stage-md.webp", width: 2000 });

for (const { name, width } of targets) {
  const out = path.join(OUT_DIR, name);
  const res = await graded().resize({ width, withoutEnlargement: true }).webp({ quality: 88 }).toFile(out);
  console.log(`étalonnage ${contrast} → ${out} (${res.width}×${res.height}, ${Math.round(res.size / 1024)} Ko)`);
}
