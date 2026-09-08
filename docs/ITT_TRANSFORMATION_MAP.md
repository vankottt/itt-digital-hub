# ITT transformation map

CIT is immutable source. This table records how the copied implementation is reused for ITT Digital Hub.

| Current CIT | New ITT purpose | Decision | Notes |
| --- | --- | --- | --- |
| Next.js App Router, BG/EN, Tailwind tokens, fonts, motion, Container/Section/Header/Footer | App shell | KEEP | Isolated copy only; no CIT git/Vercel coupling. |
| `Hero`, `SectionHeading`, `ButtonLink`, `ArrowLink` | Summit homepage framing | ADAPT | Editorial hero, no CIT/UASG video. Eyebrow = Applied AI Consultancy. |
| Homepage section spy + primary nav | One-page Summit IA | ADAPT | Work, What we solve, Approach, About, Contact. |
| `ProjectListItem` / `ProjectMeta` / project routes | Selected work | ADAPT | Three honest examples; no wine/tourism; no fabricated metrics. |
| `PersonPortrait` / team presentation | Two complementary specialists | ADAPT | Ivan Todorov + Ivan Tomchev. No join-us vacancy theatre. |
| `MethodologyLoop` (10-stage ASAESIS) | How we work | REMOVE from public | Three-step Understand / Design / Build uses the existing 3-column ruled grid. |
| Pillars (education / research / applied science) | Problems we help solve | ADAPT pattern | Problem classes, not a service catalogue. |
| Institutional anchor / UASG / logo-adjacent network | Experience across | NEW on existing grid | Textual engagements only. No invented clients or logos. |
| News, Insights, campus photos, CIT mark, ASAESIS copy | Academic-centre identity | REMOVE from public | Routes redirect home. CMS/tests may still hold unused seed. |
| `/admin`, CMS, Supabase adapters | Editorial platform | KEEP unused | Do not redesign. Public site is static-first. |
| Collaboration four-route catalogue | Contact | REPLACE | LinkedIn / email / TODO scheduling. No packages or forms. |
| Privacy page | Privacy | ADAPT | ITT wording; still no registration. |
| Vercel Analytics, indexing flag, robots | Independent deploy | ADAPT | New Vercel project only. `ITT_ALLOW_INDEXING`. |
