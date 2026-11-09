/**
 * Petit format de texte avec emphase : "Dieu **agit-il** encore" → mots forts en gras.
 * Utilisé pour les sous-titres de l'intro de la Hero (apparition mot par mot).
 */

/** "a **b c** d" → [{text:"a"},{text:"b",strong:true},{text:"c",strong:true},{text:"d"}] */
export function parseEmphasis(input) {
  return input
    .split("**")
    .flatMap((part, i) =>
      part
        .split(" ")
        .filter(Boolean)
        .map((text) => ({ text, strong: i % 2 === 1 })),
    );
}

/** Version texte brut (lecteurs d'écran, SEO) : retire les marqueurs. */
export function stripEmphasis(input) {
  return input.replaceAll("**", "");
}
