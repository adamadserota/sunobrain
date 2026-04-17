-- SunoBrain: songs table for generation history.
-- Run this once in the Supabase SQL editor for project ssuxksykpyreumrgelpq.

create table if not exists public.songs (
    id uuid primary key default gen_random_uuid(),
    title text not null default 'Untitled',
    result jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists songs_created_at_idx
    on public.songs (created_at desc);

-- Shared pool (no auth). Allow anon role full access.
alter table public.songs enable row level security;

drop policy if exists "anon read" on public.songs;
drop policy if exists "anon insert" on public.songs;
drop policy if exists "anon update" on public.songs;
drop policy if exists "anon delete" on public.songs;

create policy "anon read" on public.songs
    for select to anon using (true);

create policy "anon insert" on public.songs
    for insert to anon with check (true);

create policy "anon update" on public.songs
    for update to anon using (true) with check (true);

create policy "anon delete" on public.songs
    for delete to anon using (true);
