import styles from "./hero.module.css";
import { STORY_BOUNDS } from "./heroConfig";

/**
 * Segments de progression « stories » (mobile) : un segment par chapitre de l'intro, qui se remplit au scroll.
 * Décoratif (aria-hidden). Visible seulement sur mobile pendant l'intro animée (voir hero.module.css).
 */
export default function HeroStories() {
  return (
    <div className={styles.stories} data-stories aria-hidden="true">
      {STORY_BOUNDS.slice(1).map((_, i) => (
        <span key={i} className={styles.storyTrack}>
          <i data-story-fill className={styles.storyFill} />
        </span>
      ))}
    </div>
  );
}
