import styles from "./hero.module.css";

const PLATE = "/media/images/hero-stage.webp";

/**
 * LUMIÈRES et HALOS = de petites fenêtres posées sur la scène, pas des calques plein cadre.
 *
 * Avant : 8 copies de l'image entière (chacune avec un masque) + 6 dégradés plein cadre en mélange « screen » = 14 surfaces
 * de la taille de tout le cadre à recomposer à CHAQUE image du scroll — ce qui fait ramer les téléphones.
 * Maintenant : chaque lumière n'a que la taille de sa zone utile (cône, lampe, sol…) ; l'image qu'elle montre est la même,
 * décalée pour retomber exactement au même endroit. Rendu identique, environ 5× moins de pixels à traiter.
 *
 * Chaque zone est décrite dans le repère du CADRE, en % : centre (x, y) et demi-axes (rx, ry) de l'ellipse de lumière.
 * `boxOf` en déduit la fenêtre (bornée au cadre) ; `local*` recalculent le centre et les rayons dans le repère de la fenêtre.
 */
const boxOf = ({ x, y, rx, ry }) => {
  const left = Math.max(0, x - rx);
  const top = Math.max(0, y - ry);
  const right = Math.min(100, x + rx);
  const bottom = Math.min(100, y + ry);
  return { left, top, w: right - left, h: bottom - top };
};
const local = (spec, box) => ({
  cx: ((spec.x - box.left) / box.w) * 100,
  cy: ((spec.y - box.top) / box.h) * 100,
  rx: (spec.rx / box.w) * 100,
  ry: (spec.ry / box.h) * 100,
});

// Cônes des projecteurs : centre en haut du cadre (y = 0), longs et étroits.
const cone = (x) => ({ x, y: 0, rx: 12, ry: 85, mask: (l) => `radial-gradient(ellipse ${l.rx}% ${l.ry}% at ${l.cx}% ${l.cy}%, #000 0%, rgba(0,0,0,.85) 35%, transparent 100%)` });
const spot = (x, y, rx, ry) => ({ x, y, rx, ry, mask: (l) => `radial-gradient(ellipse ${l.rx}% ${l.ry}% at ${l.cx}% ${l.cy}%, #000 0%, transparent 100%)` });

export const LIGHTS = [
  { key: "monitor", ...spot(8.7, 54, 6, 9) },
  { key: "b0", ...cone(19.7) },
  { key: "b1", ...cone(38.9) },
  { key: "b2", ...cone(61.6) },
  { key: "b3", ...cone(76.5) },
  { key: "left", ...spot(11, 38, 20, 26) },
  { key: "right", ...spot(91, 42, 20, 24) },
  { key: "floor", ...spot(50, 72, 42, 24) },
];

/**
 * Halos (bloom) : de la lumière ajoutée par-dessus (mix-blend-mode: screen), pas de l'image.
 * Ils partagent la `key` d'un calque lumineux : la timeline les allume ensemble.
 */
const glow = (x, y, rx, ry, rgb, a) => ({ x, y, rx, ry, rgb, a });

export const GLOWS = [
  { key: "b0", ...glow(19.7, 0, 9, 16, "120,170,255", 0.5) },
  { key: "b1", ...glow(38.9, 0, 9, 16, "255,170,100", 0.55) },
  { key: "b2", ...glow(61.6, 0, 9, 16, "255,170,100", 0.55) },
  { key: "b3", ...glow(76.5, 0, 9, 16, "120,170,255", 0.5) },
  { key: "left", ...glow(7.8, 33, 8, 13, "255,190,120", 0.6) },
  { key: "right", ...glow(94.5, 39, 8, 12, "255,190,120", 0.55) },
];

const pct = (n) => `${+n.toFixed(4)}%`;
const boxStyle = (box) => ({ left: pct(box.left), top: pct(box.top), width: pct(box.w), height: pct(box.h) });

/** Une lumière : fenêtre + masque + l'image entière décalée pour coïncider avec la scène. */
function Light({ spec }) {
  const box = boxOf(spec);
  const mask = spec.mask(local(spec, box));
  return (
    <div data-light={spec.key} className={styles.lightBox} style={{ ...boxStyle(box), WebkitMaskImage: mask, maskImage: mask }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PLATE}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className={styles.lightImg}
        style={{ width: pct(10000 / box.w), height: pct(10000 / box.h), left: pct(-(box.left / box.w) * 100), top: pct(-(box.top / box.h) * 100) }}
      />
    </div>
  );
}

/** Un halo : petite fenêtre, dégradé calculé dans son propre repère. */
function Glow({ spec }) {
  const box = boxOf(spec);
  const l = local(spec, box);
  return (
    <div
      data-light={spec.key}
      className={styles.glow}
      style={{ ...boxStyle(box), right: "auto", bottom: "auto", background: `radial-gradient(ellipse ${l.rx}% ${l.ry}% at ${l.cx}% ${l.cy}%, rgba(${spec.rgb},${spec.a}), transparent 70%)` }}
    />
  );
}

/** Image décorative (aria-hidden) : une balise <img> simple suffit, le fichier est mis en cache une seule fois. */
function Plate({ priority = false, style, ...rest }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={PLATE}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={styles.layer}
      style={style}
      {...rest}
    />
  );
}

/** Le cadre "cover" : image, voile, lumières, brume et mot d'architecture. */
export default function HeroStage({ word }) {
  return (
    <div className={styles.frame} data-frame aria-hidden="true">
      <Plate priority />
      <div className={styles.veil} data-veil />
      {LIGHTS.map((spec) => (
        <Light key={spec.key} spec={spec} />
      ))}
      {GLOWS.map((spec) => (
        <Glow key={`glow-${spec.key}`} spec={spec} />
      ))}
      <div className={styles.flare} data-flare />
      <div className={styles.haze} data-haze />
      <span className={styles.word} data-word>
        {word}
      </span>
    </div>
  );
}
