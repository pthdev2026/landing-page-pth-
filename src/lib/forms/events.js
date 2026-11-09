/**
 * Pont entre les CTA de la page et le formulaire : un CTA « Être bénévole »
 * présélectionne le mode du formulaire sans état global partagé.
 */
export const SELECT_MODE_EVENT = "pth:select-mode";

export function selectMode(mode) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SELECT_MODE_EVENT, { detail: { mode } }));
}
