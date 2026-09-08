# CIT WEBSITE — BUILD WORKFLOW (CODEX + CURSOR)

## Operating principle
AI coding agents must implement an approved design system. They must not continuously redesign the site while coding it.

## Recommended division of labor
Codex — primary builder
- repo architecture
- scaffold and dependencies
- component implementation
- content modeling
- refactors
- tests
- browser QA with available Chrome/DevTools tooling

## Cursor — secondary reviewer/polisher
- visual inspection
- screenshot-driven tweaks
- focused component edits
- independent review
- responsive polish

Do not let two agents edit the same branch simultaneously. Use separate branches/worktrees for parallel tasks.

## Phase 0 — Inputs
Required before build:
- CIT Action Plan / approved concept source
- this Build Pack
- benchmark URLs/reference screenshots
- confirmed public content
- decision log for unresolved items

## Phase 1 — Visual research extraction
Agent reviews HAI as visual north star and selected benchmark pages for their assigned pattern.
Deliverable:
- concise visual extraction notes
- no code yet
- explicit list of what is reference versus what is original CIT requirement

## Phase 2 — Original CIT concepts
Create original high-fidelity concepts for major homepage sections:

1. Header + Hero
2. System idea / why CIT
3. Integrated pillars
4. Methodology
5. Featured project
6. Insights
7. News
8. Institutional network
9. Team preview
10. Work with us
11. Footer
12. representative mobile views

Prefer separate readable section concepts over one compressed giant full-page mockup.
In autonomous Goal mode, do not wait for routine human approval: evaluate the original CIT design alternatives against the Build Pack, select the strongest coherent direction, record it in DESIGN_DECISIONS.md, and treat it as the production design spec. In interactive review mode, explicit human approval may replace this internal selection step.

## Phase 3 — Design system extraction
From the approved concept record:
- colors
- type scale
- font families/fallbacks
- spacing scale
- containers/gutters
- border/radius rules
- image treatment
- icon rules
- motion rules
- component families
- mobile behavior

## Phase 4 — Technical scaffold
Recommended V1 stack:
- Next.js App Router
- TypeScript
- Tailwind CSS or equivalent token-driven styling
- server-first/static-first rendering
- lightweight client components only when interaction requires them
- structured local content first; CMS later if justified

Do not over-engineer V1 with a database, complex state management or headless CMS before content workflows require them.

## Phase 5 — Section-by-section implementation
Implement one selected/approved visual slice at a time, using the chosen original CIT design system as the acceptance reference.
For each slice:

1. implement
2. run locally
3. capture desktop screenshot
4. compare to accepted concept
5. fix visible drift
6. verify tablet/mobile
7. verify content truth
8. commit

## Suggested order
Original V1 build order: Header/Hero → About (system idea, pillars, network) → Methodology → News → Insights → Featured project → Team → Work with us → Footer.

Goal 2 (2026-09-07) production homepage: Hero → Why CIT / Core System Model → pillars → Institutional anchor → ASAESIS → Featured project → News → Team → Work with us → Footer. Insights remains a primary-nav route only.

Goal 3 (2026-09-07) primary navigation: About → Methodology → Projects → News → Insights → Team → Work with us. Homepage scroll-spy skips Insights.

## Phase 6 — Template implementation
After homepage design system is stable:
- About
- Methodology detail
- Projects listing
- Project detail
- Insights listing/detail
- News listing/detail
- People listing/detail
- Work with us

## Phase 7 — Production QA
Run:
- visual fidelity review
- responsive review
- keyboard/accessibility review
- content truth review
- BG/EN review
- performance review
- SEO metadata review
- broken-link review
- build/lint/typecheck/tests

## Visual QA loop

## DESIGN → IMPLEMENT → RUN → SCREENSHOT → COMPARE → DIFF → FIX → SCREENSHOT → APPROVE.
A passing build is not visual acceptance.

## Reference viewport set
Desktop: 1440 × 1000
Laptop: 1280 × 800
Tablet: 768 × 1024
Mobile: 390 × 844
These are working QA viewports and may be extended if real analytics/device requirements emerge.

## Commit strategy
Prefer small commits by coherent visual/function slice.
Example:
feat: scaffold CIT site
feat: implement approved header and hero
feat: add methodology system diagram
feat: add featured project template
fix: mobile navigation and BG wrapping

## Branch discipline
main — stable
feature/* — implementation
review/* — optional visual/review worktree
No unreviewed broad AI refactor should land together with a visual feature.

## Definition of done for a section
- matches approved concept closely
- responsive at reference sizes
- semantic markup
- keyboard/focus behavior where interactive
- no invented public claims
- content not hard-coded into reusable component logic
- no console errors
- no obvious layout shift/overflow
- reviewed screenshot stored or noted for comparison

## LIVE REFERENCE WORKFLOW
The curated representative URLs live in 04_BENCHMARK_REFERENCE_MAP. Do not treat them as a mandatory crawl queue.

Use live sites on demand:
- visual grammar / editorial rhythm / navigation / institutional tone → Stanford HAI
- research storytelling / people / data visuals → Complexity Science Hub
- systems/data/society positioning → MIT IDSS
- methodology/system diagrams → Dark Matter Labs
- project detail / collaboration / partner architecture → Alan Turing Institute
- Research × Education × Knowledge Transfer → Cambridge IfM
- IA / research and insights taxonomy → Oxford Internet Institute
- applied collaboration / demonstrator pathways → Connected Places Catapult
- technology transfer / piloting / partner pathways → VTT
- programmes / demonstrators / deep-tech application → Digital Catapult

For each live-reference lookup:

1. start with a concrete design/content question;
2. open the smallest relevant set of pages;
3. extract the principle/pattern, not the styling;
4. translate it into the selected CIT design language;
5. record material influence in DESIGN_DECISIONS.md;
6. return to implementation.

Do not repeatedly re-audit references that have already answered the question. Do not let live-site browsing consume the build objective.

## Decision rule
When the design concept is ambiguous, return to the design spec and the task-specific live references rather than silently inventing a new UI pattern. In autonomous Goal mode, make the best conservative professional choice, record it, and continue unless the ambiguity is a genuine external blocker.
