"use client";

import { selectMode } from "@/lib/forms/events";
import { track } from "@/lib/analytics";

const trackingByMode = {
  volunteer: "cta_volunteer_click",
  invest: "cta_invest_click",
  donate: "cta_donate_click",
  partner: "cta_partner_click",
  member: "cta_member_click",
  contact: "cta_contact_click",
};

const variants = {
  solid: "rounded-full bg-ivory text-ink shadow-[0_8px_28px_rgba(0,0,0,0.35)] hover:bg-white",
  ghost: "rounded-full border border-ivory/25 bg-ink/45 text-ivory hover:border-ivory/55 hover:bg-ink/65",
  red: "rounded-full bg-crimson text-ivory hover:bg-signal",
  // Boutons de la Hero : pilules (référence Saki). Principal = blanc, texte noir, ombre douce ; secondaire = sombre.
  signal: "rounded-full bg-ivory text-ink shadow-[0_8px_28px_rgba(0,0,0,0.4)] hover:bg-white hover:shadow-[0_10px_34px_rgba(0,0,0,0.5)]",
  outline: "rounded-full border border-ivory/25 bg-ink/45 text-ivory hover:border-ivory/55 hover:bg-ink/65",
};

function Arrow() {
  return (
    <svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none">
      <path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Bouton d'action. Si `mode` est fourni, il présélectionne le formulaire de participation
 * puis laisse l'ancre faire défiler jusqu'à la section.
 */
export default function CTAButton({
  href = "#soutenir",
  mode,
  variant = "solid",
  arrow = false,
  children,
  className = "",
  ...rest
}) {
  const handleClick = () => {
    if (mode) {
      selectMode(mode);
      track(trackingByMode[mode] ?? "cta_click", { mode });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`inline-flex min-h-12 items-center justify-center gap-3 px-7 font-sans text-[length:var(--text-small)] font-medium transition-[background-color,border-color,box-shadow] duration-200 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow ? <Arrow /> : null}
    </a>
  );
}
