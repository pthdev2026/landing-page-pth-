import styles from "./hero.module.css";
import Subtitle from "@/components/ui/Subtitle";

/**
 * Sous-titres de l'intro — visibles UNIQUEMENT pendant l'intro animée (data-intro).
 * Décoratifs pour les lecteurs d'écran (aria-hidden) : leur version texte est fournie
 * par un paragraphe `sr-only` dans Hero.jsx. Ainsi personne ne perd l'information.
 * Tous les textes sont au CENTRE de l'écran et sur fond noir ; la carte `welcome` (facultative) a des lettres plus espacées.
 */
export default function HeroIntro({ question, answer, welcome }) {
  return (
    <>
      <div className={styles.intro} data-intro aria-hidden="true">
        <Subtitle text={question} data-intro-q />
        <Subtitle text={answer} data-intro-a />
      </div>
      {welcome ? (
        <div className={`${styles.intro} ${styles.introWelcome}`} data-intro aria-hidden="true">
          <Subtitle text={welcome} data-intro-w />
        </div>
      ) : null}
    </>
  );
}
