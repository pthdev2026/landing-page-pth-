import styles from "./hero.module.css";
import { stats } from "@/content/fr";

const fmt = (item) =>
  `${item.prefix ?? ""}${item.value.toLocaleString("fr-FR", { minimumFractionDigits: item.decimals ?? 0 })} ${item.suffix ?? ""}`.trim();

/**
 * Repères chiffrés (mobile) : une ligne sobre, la preuve dès le premier écran. Chiffres RÉELS uniquement,
 * lus dans `stats.items` (fr.js) : jamais de valeur écrite ici. Une donnée manquante (`value: null`) masque l'élément.
 * Décoratif (aria-hidden) : les mêmes chiffres sont lus dans la section « Nos chiffres ».
 */
export default function HeroChips() {
  const items = stats.items.filter((item) => item.value != null);
  const audience = items.find((item) => item.wide && item.unit);
  const instagram = items.find((item) => item.label === "Instagram");
  const chips = [
    audience && { key: "audience", figure: fmt(audience), caption: audience.unit },
    instagram && { key: "instagram", figure: fmt(instagram), caption: `${instagram.unit} ${instagram.label}` },
  ].filter(Boolean);
  if (!chips.length) return null;

  return (
    <div className={styles.chips} aria-hidden="true">
      <div data-chip className={styles.chipRow}>
        {chips.map((chip, i) => (
          <div key={chip.key} className="contents">
            {i > 0 ? <span className={styles.chipRule} /> : null}
            <div className={styles.chip}>
              <span className={styles.chipFigure}>{chip.figure}</span>
              <span className={styles.chipCaption}>{chip.caption}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
