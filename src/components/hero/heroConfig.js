/**
 * Réglages de la Hero (à ajuster ici, sans toucher à la logique).
 */


/**
 * Carte « Bienvenue chez PTH » : au centre, sur fond noir, juste avant que la salle ne s'allume.
 * Toute la suite (lumière, révélation) est décalée de WELCOME_SHIFT unités (voir heroTimeline.js). false = pas de carte.
 */
export const WELCOME = true;
export const WELCOME_SHIFT = WELCOME ? 4.2 : 0;

/** Durée de la timeline en "unités" (progression = temps / durée). Voir heroTimeline.js. */
export const TIMELINE_UNITS = 20 + WELCOME_SHIFT;

/**
 * Longueur du scroll épinglé = unités × vitesse (en % de la hauteur d'écran PAR UNITÉ). Plus grand = séquence plus lente.
 * Mobile plus lent par unité : le pouce avance par petits gestes, la lecture doit rester confortable.
 */
/** Bornes des chapitres (en unités) pour les segments « stories » : question · réponse · bienvenue · la salle · le manifeste. */
export const STORY_BOUNDS = WELCOME
  ? [0, 6.2, 10.9, 10.8 + WELCOME_SHIFT, 13.8 + WELCOME_SHIFT, TIMELINE_UNITS - 1]
  : [0, 6.2, 10.6, 13.8, TIMELINE_UNITS - 1];
// (le dernier segment se termine 1 unité avant la fin : les segments s'effacent ensuite, l'écran final reste propre)

export const SCROLL_PER_UNIT = { desktop: 17.5, mobile: 13.5 };
export const SCROLL_DISTANCE = {
  desktop: Math.round(SCROLL_PER_UNIT.desktop * TIMELINE_UNITS),
  mobile: Math.round(SCROLL_PER_UNIT.mobile * TIMELINE_UNITS),
};

/**
 * Immersion MOBILE (≤ 767 px, écran le plus regardé) — chaque effet est un interrupteur :
 *  - MOBILE_STORIES : segments de progression en haut, façon « stories » (un par chapitre de l'intro) ;
 *  - MOBILE_PAN     : travelling latéral de la caméra sur le plateau pendant que la salle s'allume
 *                     (le cadrage 16:9 recadré en portrait cache la moitié du décor : on le fait découvrir en balayant) ;
 *  - MOBILE_CHIPS   : deux cartes de verre flottantes avec les vrais chiffres (voir HeroChips.jsx).
 */
export const MOBILE_STORIES = true;
export const MOBILE_PAN = true;
export const MOBILE_CHIPS = true;

/** Bandes noires « cinémascope » qui s'ouvrent au moment du « Oui. ». false = plein écran dès le début. */
export const LETTERBOX = true;
