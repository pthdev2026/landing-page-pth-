/**
 * Événements de conversion. Solution analytics encore à définir :
 * tout passe par `track()` pour brancher Plausible/GA/PostHog en un seul endroit.
 *
 * Événements suivis (voir docs/07-tech-architecture.md) :
 * cta_volunteer_click · cta_invest_click · cta_donate_click ·
 * form_started · form_submitted · section_origin_view
 */
export function track(event, props = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.plausible === "function") {
    window.plausible(event, { props });
  }
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, props);
  }
}
