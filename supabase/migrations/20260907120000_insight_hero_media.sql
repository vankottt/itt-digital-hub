-- Insight card/hero media via the existing media library.
-- published_on and author already exist on public.insights from the initial schema.
-- Backward-compatible: nullable, on delete set null.

alter table public.insights
  add column if not exists hero_media_id text references public.media (id) on delete set null;

create index if not exists insights_hero_media_idx on public.insights (hero_media_id);
