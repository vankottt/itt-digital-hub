-- CIT V2 content platform
-- Apply with: supabase db push / supabase migration up
-- Roles live in public.staff (not auth.users user_metadata).

create schema if not exists private;

do $$ begin
  create type public.staff_role as enum ('admin', 'editor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publication_state as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_lifecycle as enum ('concept', 'proposed', 'active', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.partner_relationship as enum ('proposed', 'under_discussion', 'confirmed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.person_kind as enum ('planned_role', 'appointed_person');
exception when duplicate_object then null;
end $$;

create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  role public.staff_role not null default 'editor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id text primary key,
  storage_path text,
  public_url text not null default '',
  title text,
  alt_bg text not null default '',
  alt_en text not null default '',
  caption_bg text,
  caption_en text,
  source text,
  source_url text,
  usage_note text,
  copyright_note text,
  temporary boolean not null default false,
  replacement_required boolean not null default false,
  mime_type text,
  byte_size integer,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.staff (user_id) on delete set null,
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.projects (
  id text primary key,
  slug text unique not null,
  title_bg text not null default '',
  title_en text not null default '',
  summary_bg text not null default '',
  summary_en text not null default '',
  standfirst_bg text not null default '',
  standfirst_en text not null default '',
  status text not null default 'pilot-concept',
  lifecycle public.project_lifecycle not null default 'concept',
  type_bg text not null default '',
  type_en text not null default '',
  domain_bg text not null default '',
  domain_en text not null default '',
  methodology_name text not null default 'ASAESIS',
  hero_media_id text references public.media (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  publication_state public.publication_state not null default 'draft',
  featured boolean not null default false,
  related_project_slugs text[] not null default '{}',
  related_insight_slugs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references public.staff (user_id) on delete set null,
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.insights (
  id text primary key,
  slug text unique not null,
  type text not null default 'concept-note',
  title_bg text not null default '',
  title_en text not null default '',
  summary_bg text not null default '',
  summary_en text not null default '',
  body_bg text[] not null default '{}',
  body_en text[] not null default '{}',
  topics_bg text[] not null default '{}',
  topics_en text[] not null default '{}',
  related_project_slugs text[] not null default '{}',
  source_bg text,
  source_en text,
  published_on date,
  author text,
  seo jsonb not null default '{}'::jsonb,
  publication_state public.publication_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references public.staff (user_id) on delete set null,
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.people (
  id text primary key,
  slug text unique not null,
  kind public.person_kind not null default 'appointed_person',
  name_bg text not null default '',
  name_en text not null default '',
  role_bg text,
  role_en text,
  affiliation_bg text,
  affiliation_en text,
  expertise_bg text[] not null default '{}',
  expertise_en text[] not null default '{}',
  bio_bg text[] not null default '{}',
  bio_en text[] not null default '{}',
  photo_media_id text references public.media (id) on delete set null,
  related_project_slugs text[] not null default '{}',
  related_insight_slugs text[] not null default '{}',
  seo jsonb not null default '{}'::jsonb,
  publication_state public.publication_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references public.staff (user_id) on delete set null,
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.partners (
  id text primary key,
  slug text unique not null,
  name_bg text not null default '',
  name_en text not null default '',
  relationship public.partner_relationship not null default 'proposed',
  note_bg text,
  note_en text,
  publication_state public.publication_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_by uuid references public.staff (user_id) on delete set null,
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.site_settings (
  id text primary key default 'global',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff (user_id) on delete set null
);

create table if not exists public.preview_tokens (
  token text primary key,
  entity_type text not null,
  entity_slug text not null,
  expires_at timestamptz not null,
  created_by uuid references public.staff (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists projects_state_idx on public.projects (publication_state);
create index if not exists insights_state_idx on public.insights (publication_state);
create index if not exists people_state_idx on public.people (publication_state, kind);
create index if not exists partners_rel_idx on public.partners (relationship, publication_state);
create index if not exists media_temp_idx on public.media (temporary, replacement_required);

create or replace function private.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.staff where user_id = auth.uid()
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid())
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'admin')
$$;

revoke all on function private.current_staff_role() from public, anon, authenticated;
revoke all on function private.is_staff() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.current_staff_role() to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.staff enable row level security;
alter table public.media enable row level security;
alter table public.projects enable row level security;
alter table public.insights enable row level security;
alter table public.people enable row level security;
alter table public.partners enable row level security;
alter table public.site_settings enable row level security;
alter table public.preview_tokens enable row level security;

drop policy if exists staff_self_read on public.staff;
create policy staff_self_read on public.staff for select to authenticated
  using (user_id = auth.uid() or private.is_admin());

drop policy if exists staff_admin_write on public.staff;
create policy staff_admin_write on public.staff for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select to anon, authenticated
  using (true);

drop policy if exists media_staff_write on public.media;
create policy media_staff_write on public.media for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select to anon, authenticated
  using (publication_state = 'published' or private.is_staff());

drop policy if exists projects_staff_write on public.projects;
create policy projects_staff_write on public.projects for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists insights_public_read on public.insights;
create policy insights_public_read on public.insights for select to anon, authenticated
  using (publication_state = 'published' or private.is_staff());

drop policy if exists insights_staff_write on public.insights;
create policy insights_staff_write on public.insights for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists people_public_read on public.people;
create policy people_public_read on public.people for select to anon, authenticated
  using (
    (publication_state = 'published' and kind = 'appointed_person')
    or private.is_staff()
  );

drop policy if exists people_staff_write on public.people;
create policy people_staff_write on public.people for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists partners_public_read on public.partners;
create policy partners_public_read on public.partners for select to anon, authenticated
  using (
    (publication_state = 'published' and relationship = 'confirmed')
    or private.is_staff()
  );

drop policy if exists partners_staff_write on public.partners;
create policy partners_staff_write on public.partners for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select to anon, authenticated
  using (true);

drop policy if exists settings_staff_write on public.site_settings;
create policy settings_staff_write on public.site_settings for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists preview_staff_all on public.preview_tokens;
create policy preview_staff_all on public.preview_tokens for all to authenticated
  using (private.is_staff())
  with check (private.is_staff());

-- Storage bucket + policies (idempotent)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_bucket_public_read on storage.objects;
create policy media_bucket_public_read on storage.objects
  for select to public
  using (bucket_id = 'media');

drop policy if exists media_bucket_staff_insert on storage.objects;
create policy media_bucket_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and private.is_staff());

drop policy if exists media_bucket_staff_update on storage.objects;
create policy media_bucket_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and private.is_staff())
  with check (bucket_id = 'media' and private.is_staff());

drop policy if exists media_bucket_staff_delete on storage.objects;
create policy media_bucket_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and private.is_staff());

-- No anon writes
revoke insert, update, delete on public.projects, public.insights, public.people, public.partners, public.media, public.site_settings, public.staff, public.preview_tokens from anon;
grant select on public.projects, public.insights, public.people, public.partners, public.media, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.projects, public.insights, public.people, public.partners, public.media, public.site_settings, public.preview_tokens, public.staff to authenticated;
