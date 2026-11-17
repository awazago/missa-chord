-- MissaChord — Schema PostgreSQL para Supabase (Free -> Pro)
-- Execute no SQL Editor do projeto Supabase

create extension if not exists "pgcrypto";

-- Perfis de usuário (sincronizado com auth.users do Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Acervo de músicas em formato ChordPro
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  original_key text not null default 'C',
  preferred_key text,
  capo int default 0,
  chord_pro text not null,
  moments text[] not null default '{}',
  seasons text[] not null default '{todos}',
  rating int not null default 5 check (rating between 1 and 5),
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_songs_user_rating on public.songs(user_id, rating desc);
create index if not exists idx_songs_moments on public.songs using gin(moments);

-- Setlists de Missa (ex: missa_terceiro_domingo_tempo_comum)
create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  title text not null,
  celebration_date date not null,
  liturgical_day text not null,
  season text not null default 'tempo_comum',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_setlists_user_date on public.setlists(user_id, celebration_date desc);

-- Row Level Security (RLS): cada músico acessa apenas seu próprio acervo
alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.setlists enable row level security;

create policy "Usuários veem próprio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "Usuários atualizam próprio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Usuários gerenciam próprias músicas" on public.songs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam próprios setlists" on public.setlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
