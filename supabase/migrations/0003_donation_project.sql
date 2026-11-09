-- PTH — don fléché vers un projet précis (page /projets, brief du 2026-10-18).
-- À exécuter UNE fois, APRÈS 0001_init.sql et 0002_donation_payments.sql.
-- `project` : le slug du projet soutenu (ex. "origin", "pth"), ou NULL pour un don général à PTH (comportement
-- d'avant cette fonctionnalité, inchangé). Jamais un identifiant Stripe — juste une étiquette informative,
-- revérifiée côté serveur contre le vrai catalogue de projets avant chaque écriture (voir api/donate/route.js).

alter table public.donation_payments
  add column if not exists project text;

create index if not exists donation_payments_project_idx on public.donation_payments (project);
