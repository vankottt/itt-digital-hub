# DESIGN_DECISIONS — CIT Website

V1 direction remains the production spec. V2 refines pacing, photography and diagram hierarchy; it does not replace Drafting Editorial.


This file records the selected original CIT design direction and every material benchmark influence. Once selected, the direction is the internal production design spec (see `docs/03_DESIGN_SYSTEM.md`, "Design approval rule").

## 1. Reference inspection (2026-09-05, live pages)

### Stanford HAI — https://hai.stanford.edu/ (visual north star)
Observed (principles only, no values copied): a five-item primary nav plus a small utility group and a compact lockup that names the university; a single-statement hero over one large media surface with two restrained actions; large section headings with tight tracking and a 27px lead paragraph next to them; 18px body; section padding in the 48–96px range; full-width tinted bands alternating with white; numbered section markers in a mono face; large photographic tiles; a deep plum block for one section only.
Taken for CIT: nav restraint and institutional anchor in the lockup; one-statement hero with ≤2 actions; the heading + lead pairing; 96px vertical rhythm; alternating white / tinted bands; a single dark band reserved for methodology.
Explicitly not taken: Circular typeface, plum/lavender/blue palette, rounded photo panels, video hero (later superseded by CIT's own infrastructure overlay — §6), the "01 Research" numbered section labels, any layout composition. A news carousel was not taken from HAI in V1; Goal 2 (2026-09-07) introduces a CIT-native editorial strip — see §7.

### Dark Matter Labs — https://darkmatterlabs.org/
Taken: the idea that system components can carry short codes (e.g. "A-1") and that a methodology can be shown as a matrix of intersecting elements. Translated into CIT's mono "stage code" labels on nodes (`01`–`10`) and the component → failure-mode table.
Not taken: dark experimental identity, ambient animation, philosophical density.

### MIT IDSS — https://idss.mit.edu/
Taken: compressing the institute into one sentence built on an *intersection* of disciplines. CIT's hero support copy and About opening follow this "at the intersection of…" logic using the Action Plan's own list (systems architecture, systems engineering, statistics, economics, AI, behavioural analysis, public-policy research).
Not taken: layout, colour, dated news-grid pattern.

### Not opened (no concrete question arose during the build)
CSH, Turing, IfM, OII, Connected Places Catapult, VTT, Digital Catapult. Their functional patterns were applied from the Build Pack descriptions: Turing-style project metadata (status / type / domain) and section order; IfM Research × Education × Knowledge-Transfer feedback framing for the pillars; Catapult/VTT audience-segmented "Work with us" routes.

## 2. Selected direction — "Drafting Editorial"

One sentence: an institutional editorial page (calm, serif, white space) onto which the Center's systems are drawn the way an engineer draws — hairline rules, coded nodes, arrows, feedback loops, one amber marker for what is being adapted.

Why this direction: it satisfies the Build Pack (HAI-level editorial clarity, engineered differentiation), is distinct from the AI-startup and SaaS idioms, differentiates from HAI (which is sans-only and photo-led), and reads as "research institution" in both Bulgarian and English because the serif carries Cyrillic well.

### Typography
- Display / headings: **Source Serif 4** (400, 500, 600; Latin + Cyrillic). Tracking −0.01em to −0.02em above 32px.
- Body / UI: **IBM Plex Sans** (400, 500, 600; Latin + Cyrillic).
- Technical labels (metadata, stage codes, diagram labels): **IBM Plex Mono** (400, 500; Latin + Cyrillic), 12–13px, uppercase with +0.06em tracking for labels only. Never used for body copy.
- Scale (desktop → mobile): hero 60→38px; h1 52→36px; h2 40→30px; h3 26→22px; lead 22→19px; body 17px; small 15px; meta 12–13px. Line heights: display 1.05–1.1; body 1.6.

### Colour tokens
| token | value | use |
|---|---|---|
| paper | #FFFFFF | page |
| paper-2 | #F4F4F0 | tinted bands |
| paper-3 | #EAEBE5 | deeper tint, table stripes |
| ink | #12161C | headings, body |
| ink-2 | #3D4650 | secondary text |
| ink-3 | #5F6873 | muted text (≥4.5:1 on paper, paper-2 and paper-3 — darkened after axe flagged 4.37:1 on paper-2) |
| line | #DEDFD8 | hairlines |
| line-strong | #B9BBB2 | emphasised rules |
| marine | #102849 | institutional deep tone sampled from the supplied logo: dark band, primary button, footer, Work-with-us header control |
| marine-2 | #1A3A66 | hover of marine |
| marine-tint | #E6EBF3 | light callouts |
| spruce | #1E6B58 | reserved teal-green sibling of marine; not used on the public header |
| spruce-2 | #1A5B4B | hover / current of spruce |
| amber | #D98E2B | the CIT accent: diagram marker, active state, focus ring |
| amber-ink | #8A5514 | amber as text on paper (AA) |
| on-dark | #F4F4F0 / #B7C3D0 | text on marine (and spruce if used) |

Rule: amber is a marker, never a surface. Marine is used for one dark band per page at most, plus footer and the compact Work-with-us header control (same fill and hover as the primary button).

### Layout
- Container 1280px max, gutters 20px (mobile) / 32px (tablet) / 48px (desktop). 12-column mental grid; editorial splits 5/7 and 4/8.
- Section rhythm 96px desktop / 64px mobile. Every section opens with a 1px hairline rule and a small mono label + serif heading pair ("ruled page" signature).
- Media and diagrams are square-cornered with a hairline frame; radius is 2px on controls only.

### Controls
- Primary button: marine surface, paper text, 2px radius, 48px height. Secondary: hairline ink border. Work-with-us header control: same marine fill and `marine-2` hover as the primary button, compact (`h-9`) for the nav. Text links: underline offset 3px, amber underline on hover. Arrow links use an inline SVG arrow, never Unicode arrows.
- Focus: 2px amber outline, 2px offset, everywhere.

### Systems diagram grammar (signature asset family)
- Nodes: hairline rectangle (ink 1px, 2px radius) or 6px circle; mono code (`01`) + sans label.
- Relations: 1px lines with 6px triangular arrowheads; feedback relations dashed.
- Emphasis: amber dot or amber stroke; on the marine band, lines are paper at 24% and the marker stays amber.
- Diagram areas may carry a 24px dotted drafting grid at low opacity; never elsewhere.
- Every diagram has a visually hidden or adjacent textual explanation and reflows to a vertical list ≤ 768px.

### Motion
- Only: hover/focus transitions (150–200ms), methodology stage highlight on hover/focus, a single dash-offset draw of the loop path on first view. All disabled under `prefers-reduced-motion`. No scroll-jacking, parallax or ambient animation.
- **Homepage overlay video (2026-09-06, encoding 2026-09-07):** the muted looping local infrastructure clip with pause control is an explicit exception to the older generic “no autoplay video” rule. Insight YouTube embeds remain without autoplay. See section 6.

### Imagery and mark
- Signature visual layer remains diagrams. Temporary UASG campus photography (cropped from official homepage sliders) is used only as institutional atmosphere. Goal 2 (2026-09-07): homepage no longer uses a full-bleed marine hall plate; `campus-hall.jpg` is a contained institutional figure beside the UASG statement. Facade remains on About / mission; hall on About / context and Work with us. Public figures have no visible honesty captions; `alt` still names the university setting and does not present the pictures as CIT activity. Tracked in `docs/TEMP_IMAGE_SOURCES.md`; replace before final public launch. No stock photography and no campus photos attached to project or insight records. Generated editorial illustrations are attached to the seed concept notes `why-social-systems-behave-like-algorithms`, `asaesis-from-framework-to-method` and `testing-instead-of-assuming`; they are not captioned as Center staff, laboratory or results. `testing-instead-of-assuming` also places a second library figure on a whole-line media id in the body. The homepage opening is the infrastructure overlay from §6, not a campus photograph.
- **Team portraits** (2026-09-06, revised): grayscale cutouts over a large circular `marine-tint` plate that turns `marine` on hover. The torso sits inside the circle; only a little of the crown breaks the rim. Never colourised. Hover on the portrait is graphic only (`translateY(-4px) scale(1.018)`, 220ms, gated to `hover: hover` + `pointer: fine`); the portrait is not a link. LinkedIn remains a name+icon control when a URL is confirmed. One quiet “+” slot replaces three equal “Coming Soon” circles. Roles omitted until confirmed.
- **Logo**: the CIT mark is the supplied navy-and-grey sign (structure + rising bars + baseline node). It is used as `public/brand/cit-mark.png` (white background removed, greys preserved) on paper, `public/brand/cit-mark-white.png` (navy knocked out to `on-dark`, greys lifted) on the marine footer, and `src/app/icon.png` / `apple-icon.png` on white for favicons. The `marine` token stays `#102849`, sampled from this mark. The drafted three-node SVG mark stays retired.

## 3. Opening composition — alternatives evaluated

Two coded alternatives for the first viewport were rendered at 1440×1000 (BG, the longer language) and compared against the Build Pack hero rules (one proposition, ≤2 actions, no kicker, systems hint without dashboard). Screenshots: `home-bg-1440-v2` (A) and `home-bg-1440-stacked` (B) in the QA log.

- **A. Statement + drawing (7/5 split)** — serif headline, lead and actions on the left, the "anatomy of a designed system" loop on the right. Result: the Bulgarian headline wrapped to 6–7 lines even at 56px (Cyrillic words are long and `text-wrap: balance` shortened lines further); the diagram column was ~500px and its node labels rendered at ~10px.
- **B. Full-width statement, then lead/actions beside the drawing (6/6)** — the headline spans the container (4 lines in BG, 3 in EN at 54px), the lead and both actions sit left of a ~570px diagram whose labels render at ~12px. Everything — statement, lead, actions, diagram — is inside the first viewport at 1440×1000; at 1280×800 the diagram's upper half remains visible as the systems hint.

Selected: **B ("stacked")**, implemented as `Hero layout="stacked"`. It resolves Bulgarian wrapping without shrinking the type, gives the signature diagram legible scale, and keeps the composition calm. The split layout remains available in the component for future pages.

Type decision made during the comparison: `text-wrap: pretty` (not `balance`) on the hero headline, and Bulgarian `locl` glyph forms disabled site-wide because Source Serif 4 ships them while IBM Plex Sans does not — mixed conventions between headings and body read as an error.

## 4. Content-presentation decisions with design impact
- Status is always visible on projects as a mono label with a neutral vocabulary: *Pilot concept*, *Proposed research mandate*, *In development*, *Active pilot*, *Completed* (Build Pack provisional vocabulary, extended by one value required by the mandate letter). Only the first two are used in V1.
- People page shows supplied grayscale cutouts over a circular plate, plus the planned governance functions. Names without confirmed titles; no invented roles.
- Institutional network shows UASG as text lockup, not a logo wall.
- Work with us uses four collaboration routes as a ruled list, not pricing cards.

## 5. V2 refinements (2026-09-05)

V1 already had the right identity. Browser evidence on the deployed site showed documentary overload: three homepage diagrams plus an anatomy table, a diagram-led hero, and a categorical “run like algorithms” heading.

### Visual grammar (unchanged tokens, changed rhythm)

Stanford HAI still informs only whitespace, hierarchy and the alternation of statement / large media / short explanation. CIT remains serif + drafting diagrams + marine/amber. No Stanford red, no numbered “01 Research” kickers, no photographic tile carousels. Goal 2’s News strip is a CIT-native editorial feed (scroll-snap, drafting fallback), not a HAI photo carousel — see §7.

Homepage signature visuals are limited to two:

1. **Core System Model** (`SystemLoop`) — goals → architecture and roles → rules and decision points → information → actions/outputs → outcomes/performance → feedback → goals, with incentives/constraints as a concurrent input and environment as the dashed boundary. Moved out of the hero so the opening can be photographic.
2. **ASAESIS** (`MethodologyLoop` on the homepage; `MethodologyExplorer` on `/methodology`).

`SystemAnatomy` and `PillarsCycle` stay on internal pages. The featured-project value chain remains a secondary, smaller diagram.

Hero composition **C (“editorial photo”)** replaces stacked diagram-hero B: full-width statement, then lead + ≤2 actions beside a large UASG campus photograph. The Core System Model follows as the first signature visual. Bulgarian wrapping rules from V1 (`text-wrap: pretty`, no `locl` mixing) still apply.

### Copy

“Social systems run like algorithms” is replaced by source-faithful wording: human-designed social-institutional systems *have algorithmic structures* and *operate through repeatable formal and informal decision processes*. The insight slug `why-social-systems-behave-like-algorithms` is kept (stable URL); its body already uses “algorithmic structure”.

Homepage visible copy is tightened by moving anatomy, pillar purposes, the six-item integrated model and the long featured summary to About / Methodology / project pages.

### Photography

Still only temporary UASG assets, inventory in `docs/TEMP_IMAGE_SOURCES.md`. V2 uses the existing facade as the opening visual and the hall for institutional context. Additional uacg.bg news images inspected in V2 were too small, event-group, or portrait and were not added.

### Admin

Operational, not editorial: system UI, no marine hero bands, no diagrams. Public design remains code-controlled; admin edits structured fields only.

## 6. Homepage overlay — local video (2026-09-06)

The opening uses a muted looping `<video>` from the project `Video/` folder (`202609062306.mp4`), served as a full-length grayscale H.264 loop at the source frame rate (~30 fps, ~2:05 as of 2026-09-08): `public/videos/hero.mp4` (1920×1080, ~46 MiB) and `public/videos/hero-mobile.mp4` (960×540, ~15 MiB) for viewports ≤767px. The video element uses `preload="auto"`; the poster (`public/images/hero/poster.jpg`) is the first paint. Pause control remains. Reduced motion never mounts the video. The original file in `Video/` stays in colour; the web files match that duration. Public URLs carry `?v=20260908` so in-place replacements are not served from an old cache. Insight YouTube embeds stay without autoplay.

The clip shows transport infrastructure (aerial). It is not captioned as CIT laboratory, team or project activity. The previous UASG YouTube mock is retired. The older generic “no autoplay video” motion rule in section 2 is superseded by this homepage overlay decision.

## 7. Goal 2 — homepage, News and visual refinement (2026-09-07)

This pass is a controlled evolution of V2 homepage composition. It does not replace Drafting Editorial.

### Homepage narrative (supersedes the 2026-09-06 IA scroll order)

Document order is now:

Hero → Why CIT / Core System Model → Education · Research · Applied Science → Institutional anchor → ASAESIS → Featured project → News → Team → Work with us → Footer.

Removed from the homepage (not from the site): Insights preview; compact GovernanceList. Insights remains in primary nav and `/insights`. Governance remains on About and Team. Clicking Insights on the homepage goes to `/insights` rather than an in-page hash.

Visible documentary density is reduced by relocation, not by emptying the idea: pillars are a three-column structural statement; Work with us is four audience rows; institutional copy no longer leads with “being finalized” / “planned”.

### Signature visuals

Still two: Core System Model, then ASAESIS. The homepage no longer stacks a full-bleed marine photo band on top of the methodology band. Hero overlay remains the media exception from §6. Methodology remains the page’s one dark editorial band, plus footer.

Institutional homepage treatment: concise UASG statement beside a contained grayscale hall photograph. Planned agreement/council status stays on About.

ASAESIS desktop loop is unchanged in concept. Homepage mobile uses a compact ten-row index (code, short title, Structure/Loop) with one open description. The methodology page keeps the full rail.

Featured Wine × Tourism sits before News, with status, methodology link and the market chain on a drafting grid. Status remains Pilot concept.

### News editorial strip

Homepage News is a CSS scroll-snap strip (no carousel library, no autoplay). Target peek of the next card when more than one item exists; previous/next controls only when the strip overflows. Published items are ordered newest source publication date first (slug tie-breaker); the homepage shows at most five (`HOME_NEWS_PREVIEW_LIMIT`), while `/news` lists the full published set. The confirmed UASG article card uses a generated editorial photograph (`object-cover`); the Darachev infographic is in the article body (`object-contain`). Campus photography is not used as News filler. Items without library media still use the drafting fallback. `/news` listing uses the same card hierarchy (media, type · date, headline, summary, link). `/insights` uses that same card hierarchy with type label Analysis / Анализ; notes without library media use the drafting fallback marked Analysis, not News.

### CIT curve experiment — rejected

A comma/C-hook join (CIT mark + ASAESIS return, not a Turing sine) was prototyped between Methodology → Featured project and News → Team. In the browser it read as a marine bite under the sticky header, not as rigid architecture + adaptive flow. Removed. Section joins remain hairline rules.

### Navigation, type, colour

Header is slightly denser (`4.75–5.25rem`, 48px mark). Font families and colour tokens are unchanged. Amber remains a marker.

Goal 3 (2026-09-07) supersedes the 2026-09-06 primary-nav order. Shared header, mobile menu and footer order is now About → Methodology → Projects → News → Insights → Team → Work with us. Insights stays a top-level `/insights` route with no homepage preview and is skipped by homepage scroll-spy. Homepage-mapped spy progression is About → Methodology → Projects → News → Team → Work with us, matching document order.

Stanford HAI still informs whitespace and hierarchy only. The news strip is a CIT translation of an institutional editorial feed, not a clone of hai.stanford.edu.



