/**
 * Réglages de la section « Énoncé » (le texte qui se remplit au scroll).
 */

/** Opacité des mots avant remplissage (0-1). Sur fond noir, > 0.5 se voit à peine. (Les mots sont en dégradé argenté : seule l'opacité s'anime.) */
export const DIM_ALPHA = 0.35;

/** Hauteur de la section en % de la hauteur d'écran : la différence avec 100 = longueur du scroll de remplissage. */
export const SECTION_HEIGHT = { desktop: 190, mobile: 175 };
