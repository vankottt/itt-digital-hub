# Environments

Runtime configuration for local development, Vercel preview, and production.
Do not invent credentials here. Fill values in the host (Vercel / local `.env.local`) only.

## Modes

| Surface | CMS | Signing | Indexing |
|---|---|---|---|
| `next dev` without Supabase, with `CIT_ADMIN_DEV_PASSWORD` | `local` file store | password, or a hard-coded local-only fallback | `noindex` |
| `next dev` with Supabase URL + anon key | `supabase` | `CIT_ADMIN_SESSION_SECRET` (recommended) or password | `noindex` |
| Vercel preview | same as configured env | `CIT_PREVIEW_SECRET` or `CIT_ADMIN_SESSION_SECRET` or preview password; **never** a known development string | `noindex` even if `CIT_ALLOW_INDEXING=true` |
| Vercel production | `supabase` | **`CIT_ADMIN_SESSION_SECRET` required**; `CIT_PREVIEW_SECRET` recommended | `noindex` unless `CIT_ALLOW_INDEXING=true` |

`NODE_ENV=production` is true for every Vercel build, including preview. Use `VERCEL_ENV`.

## Canonical Vercel project

The repository is linked locally to **cit-website** (`prj_wAfaaYeSPdHI7u8dzGIDA0lA0FSx`, team `darinatodorova2025-6319s-projects`). That project is the canonical CURRENT website deployment: it matches `package.json` name `cit-website`, the documented production alias `cit-website-psi.vercel.app`, and `docs/SUPABASE.md`.

Sibling projects in the same team are not canonical and must not be used for launch QA:

- **cit-uasg** (`cit-uasg.vercel.app`) — parallel CLI production deploys of older trees. Do not delete automatically.
- **cit-original-v1** — preview-only archive. Do not delete automatically.

None of these projects currently has a GitHub integration. GitHub `main` therefore does not deploy on push. Repeatable path until Git is connected:

1. Land the release on GitHub `main` as a clean commit.
2. From that clean tree, `vercel deploy` for preview QA, or `vercel --prod` only after an explicit launch decision.
3. Record the deployment `gitCommitSha` and `gitDirty`. Do not QA or launch a dirty deploy from an obsolete branch.

Optional later: in the Vercel project, connect GitHub `vankottt/cit-website`, production branch `main`, and keep `CIT_ALLOW_INDEXING` unset until launch. Do not assign public DNS until the user authorizes it.

## Required production variables

- `NEXT_PUBLIC_SITE_URL` — public origin (no trailing slash)
- `CIT_ADMIN_SESSION_SECRET` — dedicated HMAC key, not the known development fallback
- `CIT_PREVIEW_SECRET` — dedicated preview HMAC key (may equal the session secret only if that is intentional)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CIT_ALLOW_INDEXING=true` **only** after an explicit public-launch decision on the production host

Do **not** set `CIT_ADMIN_DEV_PASSWORD` or `CIT_DEV_FIXTURES` on production. `CIT_DEV_FIXTURES=1` is local `next dev` only for the people fixture. Three demonstration News articles and three Insights analyses overlay until saved from `/admin`. Local mode writes missing overlay rows into the file store on first read; Supabase receives them only when an editor saves. If a hosted demo password remains on the Production environment while Supabase is connected, remove it before public launch — supabase mode currently takes precedence, but the password is a leftover local-admin shortcut.

## Preview vs production Supabase

The hosted project **cit-website** currently serves CMS data. Preview and production may still share it.

Safer configuration, to be applied in Vercel (this repository cannot create the second project):

1. Create a separate Supabase project for preview.
2. Apply `supabase/migrations/` to that project (`npx supabase db push` after `supabase link`).
3. In Vercel, set preview-environment `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the preview project.
4. Keep production keys on the Production environment only.
5. Use different `CIT_ADMIN_SESSION_SECRET` and `CIT_PREVIEW_SECRET` on Preview vs Production even if the database is still shared.

Until step 1–4 are done, shared-database preview/production remains an operational risk (drafts and media are the same store). Separate signing secrets still prevent cookie/token reuse across environments.

## Canonical URLs

`siteUrl()` uses `NEXT_PUBLIC_SITE_URL` when set. Otherwise production uses `VERCEL_PROJECT_PRODUCTION_URL`, and preview uses `VERCEL_URL`. Preview must not advertise the production host as canonical.

## CMS fallback

When the site is in `supabase` mode and the CMS cannot be read, public pages serve the versioned TypeScript seed. That is the approved disaster-recovery path. The event is logged as `[cit-cms]` and shown on `/admin` only.
