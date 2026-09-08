# Admin

Route: `/admin` (always noindex).

Local development:

```sh
cp .env.example .env.local
# set CIT_ADMIN_DEV_PASSWORD
npm run seed   # optional; store auto-seeds on first read
npm run dev
```

Sign in as `admin@cit.local` or `editor@cit.local` with that password.

On Vercel, the same accounts work once `CIT_ADMIN_DEV_PASSWORD` is set in the project env. The store is `/tmp` and **not durable**. For a lasting CMS, configure Supabase (see `docs/SUPABASE.md`) and add the user to `staff`.

The admin UI is operational: dashboard counts, bilingual fields, draft/review/publish, preview, media metadata including temporary/replacement-required, global settings for designed homepage slots only.

Insight body is one block per line. A YouTube watch / youtu.be / Shorts URL on its own line (BG and EN) renders as an embedded clip on the public site — no autoplay, no pasted HTML. A whole-line media-library id (`media-…`) renders as an editorial figure when that record exists; unknown ids are skipped and are not printed as paragraphs.

The three demonstration News articles appear in Insights & news like any other record. Save draft persists text, source, card image and YouTube lines to the connected CMS. They are still fictional unless an editor changes the source metadata.

The three Insights analyses appear in the same list as concept notes. Each has a Bulgarian and an English diagram; the public site picks the pair from media ids ending in `-bg` / `-en`.

Set **Type** to `Concept note (Insights)` or `News article`. News items appear on `/news`, not on Insights. News cannot be published without a source publication date and BG/EN source text. Card/hero images are chosen from the media library; they are optional for publish.

Saving an existing record merges submitted fields into the stored record. Fields the form does not send are preserved. Empty submitted values still clear the corresponding optional field.

Signing secrets and preview vs production env: `docs/ENVIRONMENTS.md`.
