# Supabase setup

V2 can run without credentials (seed fallback). Production CMS uses the hosted project **cit-website** (`khaujexhgcdxwgtsyhls`, Frankfurt).

## 1. Environment

Copy `.env.example`. For hosted Auth set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable/anon key — never the service role)

These are set on the Vercel project for production and preview. Leave them unset in `.env.local` if you want the local file store (`CIT_ADMIN_DEV_PASSWORD`) instead.

Preview and production should use separate Supabase projects when possible. Exact environment rules: `docs/ENVIRONMENTS.md`.

Optional: `CIT_ALLOW_INDEXING=true` only on the final production hostname.

## 2. Migrations

SQL lives in `supabase/migrations/` (tables, indexes, RLS, storage bucket `media`, insight `hero_media_id`). Content IDs are `text` so they match the admin/seed slugs.

```sh
npx supabase login
npx supabase link --project-ref khaujexhgcdxwgtsyhls
npx supabase db push
```

## 3. Staff

Roles live in `public.staff`, not in `raw_user_meta_data`. After creating an Auth user:

```sql
insert into public.staff (user_id, email, role, display_name)
values ('<auth user uuid>', 'you@example.com', 'admin', 'Editor');
```

## 4. Import seed content

`scripts/emit-supabase-seed.ts` writes SQL from the TypeScript seed. Large project payloads can stay in versioned seed until an editor saves the record; `loadSupabaseRecords` fills an empty `payload` from seed by slug.

## 5. Storage

Bucket `media` is public-read, staff-write. The app restricts uploads to JPEG/PNG/WebP/AVIF, 8 MB.

## Security notes

- RLS enabled on all content tables
- Anon can SELECT published rows only (people: appointed + published; partners: confirmed + published)
- No anon INSERT/UPDATE/DELETE
- Service role key must never appear in `NEXT_PUBLIC_*`
- `/admin` is always `noindex`
- Enable [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) in the Auth settings when convenient.
