/**
 * Ornement : étoile à quatre branches (repris de l'affiche Nedra de la référence). Décoratif.
 * Une seule pièce de couleur : le rouge d'accent, avec une lueur douce.
 */
export default function Star({ size = 28, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`text-signal ${className}`}
      style={{ filter: "drop-shadow(0 0 10px rgba(255, 58, 36, 0.55))" }}
    >
      <path
        fill="currentColor"
        d="M12 0C12.7 7.3 16.7 11.3 24 12C16.7 12.7 12.7 16.7 12 24C11.3 16.7 7.3 12.7 0 12C7.3 11.3 11.3 7.3 12 0Z"
      />
    </svg>
  );
}
