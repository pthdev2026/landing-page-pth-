/**
 * Logo officiel PTH (blanc, fond transparent, 597 × 152). Le fichier source est dans `assets-src/logo-pth.source.webp`,
 * l'export recadré dans `public/brand/`. Décoratif par défaut (le nom est déjà dans le texte voisin) ;
 * passer `label` pour l'exposer aux lecteurs d'écran quand il est seul.
 */
export default function Logo({ className = "", label, ...rest }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-pth.webp"
      width={597}
      height={152}
      alt={label ?? ""}
      aria-hidden={label ? undefined : "true"}
      draggable={false}
      className={`block h-auto select-none ${className}`}
      {...rest}
    />
  );
}
