-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  type text not null default 'customer',
  name text not null,
  phone text not null,
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
-- Lock the table: only your server (service_role key) can read/write it. The public anon key gets no access.
alter table public.leads enable row level security;
