import { Fragment } from "react";
import styles from "./subtitle.module.css";
import { parseEmphasis } from "@/lib/text";

const GLUE = new Set(["?", "!", ":", ";"]);

/**
 * Regroupe les mots : la ponctuation haute ("?", "!") reste collée au mot précédent (espace insécable),
 * pour qu'une ligne ne se coupe jamais juste avant. Chaque mot garde son propre <span data-w> animable.
 */
function groupWords(text) {
  const groups = [];
  for (const token of parseEmphasis(text)) {
    if (GLUE.has(token.text) && groups.length) groups[groups.length - 1].push(token);
    else groups.push([token]);
  }
  return groups;
}

/**
 * Sous-titre de cinéma mot par mot. `**mot**` = mot fort (gras).
 * Chaque mot porte `data-w` (et `data-strong` s'il est fort) : c'est ce que les timelines animent.
 */
export default function Subtitle({ text, className = "", ...rest }) {
  const groups = groupWords(text);
  return (
    <p className={`${styles.subtitle} ${className}`} {...rest}>
      {groups.map((group, g) => (
        <Fragment key={g}>
          <span className={styles.wordGroup}>
            {group.map((word, i) => (
              <span key={i}>
                {i > 0 ? "\u00A0" : null}
                <span data-w data-strong={word.strong ? "" : undefined} className={`${styles.w} ${word.strong ? styles.strong : ""}`}>
                  {word.text}
                </span>
              </span>
            ))}
          </span>
          {/* L'espace entre deux groupes est HORS du bloc "nowrap" : c'est lui qui autorise le retour à la ligne. */}
          {g < groups.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
