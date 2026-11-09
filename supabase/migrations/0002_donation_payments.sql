-- PTH — module de dons Stripe v2 (ponctuel + mensuel), conforme au brief technique du 2026-10-13.
-- À exécuter UNE fois, APRÈS 0001_init.sql : Supabase ▸ SQL Editor ▸ New query ▸ coller ▸ Run.
-- N'enlève ni ne modifie rien de 0001_init.sql (table `leads`, ancienne table `donations`) : nouvelles tables
-- UNIQUEMENT. Sécurité : RLS activée SANS aucune règle publique = personne ne peut lire ni écrire avec la clé
-- « anon » (navigateur). Seul le serveur, avec la clé « service_role » (jamais exposée au navigateur), y accède.

create extension if not exists pgcrypto;

-- Met à jour `updated_at` tout seul à chaque modification d'une ligne.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Un paiement (ponctuel OU une mensualité d'un abonnement) : la table source de vérité pour le statut d'un don.
create table if not exists public.donation_payments (
  id                          uuid primary key default gen_random_uuid(),
  internal_reference          uuid not null unique,              -- = la clé d'idempotence envoyée par le navigateur
  donation_type               text not null check (donation_type in ('once', 'monthly')),
  amount_cents                integer not null check (amount_cents > 0),
  currency                    text not null default 'eur' check (currency = 'eur'),
  status                      text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  stripe_invoice_id           text unique,                       -- rempli pour les mensualités suivantes (`invoice.paid`)
  stripe_customer_id          text,
  stripe_subscription_id      text,
  donor_email                 text,
  donor_name                  text,
  lead_id                     uuid references public.leads (id) on delete set null,
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists donation_payments_created_idx on public.donation_payments (created_at desc);
create index if not exists donation_payments_status_idx on public.donation_payments (status);
create index if not exists donation_payments_subscription_idx on public.donation_payments (stripe_subscription_id);
drop trigger if exists donation_payments_set_updated_at on public.donation_payments;
create trigger donation_payments_set_updated_at before update on public.donation_payments
  for each row execute function public.set_updated_at();

-- Un abonnement (don mensuel) : son état courant, synchronisé par le webhook `customer.subscription.*`.
create table if not exists public.donation_subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  stripe_subscription_id  text not null unique,
  stripe_customer_id      text not null,
  donor_email             text,
  amount_cents            integer not null check (amount_cents > 0),
  currency                text not null default 'eur' check (currency = 'eur'),
  status                  text not null default 'active',        -- valeurs Stripe : active, past_due, canceled, unpaid, incomplete…
  cancel_at_period_end    boolean not null default false,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists donation_subscriptions_status_idx on public.donation_subscriptions (status);
drop trigger if exists donation_subscriptions_set_updated_at on public.donation_subscriptions;
create trigger donation_subscriptions_set_updated_at before update on public.donation_subscriptions
  for each row execute function public.set_updated_at();

-- Déduplication des événements Stripe : un `event.id` ne doit jamais être traité deux fois (Stripe peut renvoyer
-- le même événement plusieurs fois — retards réseau, nouvelle tentative après timeout, etc.).
create table if not exists public.stripe_webhook_events (
  stripe_event_id   text primary key,
  event_type        text not null,
  processing_status text not null default 'processing' check (processing_status in ('processing', 'done', 'error')),
  processed_at      timestamptz,
  error_message     text,
  created_at        timestamptz not null default now()
);
create index if not exists stripe_webhook_events_type_idx on public.stripe_webhook_events (event_type);

alter table public.donation_payments enable row level security;
alter table public.donation_subscriptions enable row level security;
alter table public.stripe_webhook_events enable row level security;
-- (aucune policy créée : accès public totalement fermé, comme pour `leads`/`donations` dans 0001_init.sql)
