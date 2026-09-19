-- AI Act conference leads. Public insert only; no public read.

create table if not exists public.ai_act_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  work_email text not null,
  company text not null,
  role text not null,
  marketing_consent boolean not null default false,
  session_id text,
  source text,
  campaign text,
  created_at timestamptz not null default now()
);

create index if not exists ai_act_leads_created_at_idx on public.ai_act_leads (created_at desc);
create index if not exists ai_act_leads_session_id_idx on public.ai_act_leads (session_id);

alter table public.ai_act_leads enable row level security;

drop policy if exists ai_act_leads_insert on public.ai_act_leads;
create policy ai_act_leads_insert on public.ai_act_leads
  for insert to anon, authenticated
  with check (true);

revoke select, update, delete on public.ai_act_leads from anon, authenticated;
grant insert on public.ai_act_leads to anon, authenticated;
