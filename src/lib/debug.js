/** `?debug` dans l'URL (développement uniquement) : désactive les animations liées au scroll pour vérifier les états finaux. */
export function isDebugMode() {
  return process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("debug");
}
