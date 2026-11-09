import styles from "./hero.module.css";
import { LETTERBOX } from "./heroConfig";

/**
 * Calques liés à l'ÉCRAN (pas à la scène) : ils ne bougent pas avec la caméra.
 *  - vignette  : coins assombris, concentre le regard
 *  - bottomFade: le bas de la scène se dissout dans le noir (comme la référence La La Land) :
 *                la section suivante émerge du noir, sans coupure
 *  - bars      : bandes cinémascope (2.39:1) qui s'ouvrent au moment de « Oui. »
 */
export default function HeroOverlays() {
  return (
    <>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />
      {LETTERBOX ? (
        <>
          <div className={`${styles.bar} ${styles.barTop}`} data-bar="top" aria-hidden="true" />
          <div className={`${styles.bar} ${styles.barBottom}`} data-bar="bottom" aria-hidden="true" />
        </>
      ) : null}
    </>
  );
}
