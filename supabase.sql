-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again (it also repairs a half-made table).
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  type text not null default 'customer',
  name text not null default '',
  phone text not null default '',
  email text default '',
  property text default '',
  message text default '',
  experience text default '',
  profession text default '',
  source text default 'website',
  status text default 'New',
  assigned text default '',
  notes text default '',
  created_at text,
  updated_at text
);
alter table public.leads add column if not exists type text not null default 'customer';
alter table public.leads add column if not exists name text not null default '';
alter table public.leads add column if not exists phone text not null default '';
alter table public.leads add column if not exists email text default '';
alter table public.leads add column if not exists property text default '';
alter table public.leads add column if not exists message text default '';
alter table public.leads add column if not exists experience text default '';
alter table public.leads add column if not exists profession text default '';
alter table public.leads add column if not exists source text default 'website';
alter table public.leads add column if not exists status text default 'New';
alter table public.leads add column if not exists assigned text default '';
alter table public.leads add column if not exists notes text default '';
alter table public.leads add column if not exists created_at text;
alter table public.leads add column if not exists updated_at text;
-- Lock the table: only your server (secret / service_role key) can read and write it.
alter table public.leads enable row level security;
notify pgrst, 'reload schema';
