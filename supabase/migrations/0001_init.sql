-- PTH — schéma initial (Supabase / PostgreSQL)
-- À exécuter UNE fois : Supabase ▸ SQL Editor ▸ New query ▸ coller ▸ Run.
-- Sécurité : RLS activée SANS aucune règle publique = personne ne peut lire ni écrire avec la clé « anon ».
-- Seul le serveur du site, avec la clé « service_role » (jamais exposée au navigateur), accède aux tables.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  mode        text not null check (mode in ('invest','donate','volunteer','partner','member','contact')),
  name        text not null default '',
  email       text not null,
  payload     jsonb not null default '{}'::jsonb,   -- tous les champs du formulaire
  status      text not null default 'new' check (status in ('new','contacted','archived')),
  ip_hash     text,                                  -- empreinte salée de l'IP (jamais l'IP elle-même)
  user_agent  text
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_ip_hash_created_idx on public.leads (ip_hash, created_at desc);
create index if not exists leads_status_idx on public.leads (status);

create table if not exists public.donations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  provider      text not null,                       -- 'stripe' | 'helloasso'
  provider_ref  text not null unique,                -- identifiant chez le prestataire (idempotence)
  lead_id       uuid references public.leads (id) on delete set null,
  email         text,
  name          text,
  amount_cents  integer not null check (amount_cents >= 0),
  currency      text not null default 'eur',
  frequency     text not null default 'once' check (frequency in ('once','monthly')),
  status        text not null default 'pending' check (status in ('pending','paid','failed','refunded'))
);
create index if not exists donations_created_at_idx on public.donations (created_at desc);

alter table public.leads enable row level security;
alter table public.donations enable row level security;
-- (aucune policy créée : accès public totalement fermé)

-- RGPD : purge des demandes archivées de plus de 3 ans (à planifier ou lancer à la main).
-- delete from public.leads where status = 'archived' and created_at < now() - interval '3 years';
