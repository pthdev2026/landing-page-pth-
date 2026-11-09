import { Fragment } from "react";
import { parseEmphasis } from "@/lib/text";

/**
 * Rend un texte en marquant le mot d'accent : "Faire connaître **Jésus** à travers…"
 * → le mot entre ** passe en rouge (`.text-accent`). Règle : UN seul mot d'accent par titre.
 */
export default function Accent({ text }) {
  const tokens = parseEmphasis(text);
  return tokens.map((token, i) => (
    <Fragment key={i}>
      {token.strong ? <span className="text-accent">{token.text}</span> : token.text}
      {i < tokens.length - 1 ? " " : null}
    </Fragment>
  ));
}
