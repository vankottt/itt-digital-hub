# Admin / content architecture

The public site is not a page builder. Editors manage structured records; React components own layout.

## Source of truth

1. **Versioned seed** — `src/content/*.ts`. Always available. Used as import source and as public fallback if CMS is down.
2. **Runtime CMS** — local file store (`.data/cms/store.json`) or Supabase. When connected, published records override seed by slug.
3. After a successful import, treat CMS as runtime truth and keep seed as the disaster-recovery copy until the next editorial cycle.

`npm run seed` writes the TypeScript seed into the local store.

## Modes

| Mode | When | Public | Admin |
|---|---|---|---|
| `seed` | No Supabase and no `CIT_ADMIN_DEV_PASSWORD` | Seed content | Login explains setup |
| `local` | `CIT_ADMIN_DEV_PASSWORD` set, no Supabase | Local store (seeded on first read; `/tmp` on Vercel, ephemeral) | Cookie session, admin@cit.local / editor@cit.local |
| `supabase` | `NEXT_PUBLIC_SUPABASE_URL` + anon/publishable key | Published rows via RLS | Supabase Auth + `staff` table |

## Roles

- **ADMIN** — all content, settings, media, publish
- **EDITOR** — create/edit drafts, preview, submit review / publish (same write path; keep V2 simple)

Roles live in `staff`, not in `user_metadata`.

## Workflow

DRAFT → REVIEW → PUBLISHED → ARCHIVED

Save never publishes. Publish runs validation (`src/lib/cms/truth.ts`).

Public pages must not fail closed if CMS is down. A CMS outage is logged as `[cit-cms]` and shown on `/admin`; public HTML does not expose infrastructure errors.

Preview sets an httpOnly HMAC cookie and opens the public URL. Drafts stay out of the sitemap.

## Truth controls

- Project `lifecycle`: concept | proposed | active | completed, separate from the public status label
- Expected outcomes and measured results are different fields
- Concept/proposed cannot publish non-empty measured results
- Partners: only `confirmed` + `published` appear publicly
- Team: `planned_role` cannot be published as a named profile
- Insights vs News: same table; `type` is `concept-note` or `news`. News additionally requires a source publication date and BG/EN source text to publish. Card/hero media is optional presentation metadata, not a publish gate. A whole-line `media-…` id in the body renders as an editorial figure. Published News is ordered newest source publication date first, with slug as a stable tie-breaker. The homepage shows at most five latest items (`HOME_NEWS_PREVIEW_LIMIT`); `/news` lists the full published set.
- Three demonstration News articles overlay until an editor saves them from `/admin`, with media-library ids. They are not in `npm run seed` / CMS import. Saving from admin persists them to the connected store without overwriting existing CMS rows for the same slug. They are labelled as fictional in source metadata and are not confirmed CIT news.
- Three Insights analyses overlay until saved from `/admin`, with locale-paired diagrams. They are concept notes, not research publications. Confirmed seed Insights remain the original three framework notes.

## Future AI actions

Architected, not enabled: translation draft, homepage summary, alt text, claim flags. They must never auto-publish. See `src/lib/ai/readiness.ts`.
