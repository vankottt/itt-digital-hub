# CIT WEBSITE BUILD PACK v1

## Purpose
This folder is the working source of truth for designing and building the website of the Center for Intelligent Technologies (CIT / Център за интелигентни технологии).

## Authority hierarchy
1. CIT Action Plan BG — authoritative for the Center’s mission, conceptual model, three pillars and institutional direction.
2. Confirmed decisions from the project team — authoritative for current website facts.
3. This Build Pack — authoritative for website design and implementation decisions until revised.
4. Benchmark websites — references for patterns only; never sources for facts about CIT.
5. AI-generated ideas — proposals only until explicitly accepted.

## Current fixed direction
- Visual north star: Stanford Institute for Human-Centered AI (HAI).
- Do not clone HAI. Use its institutional confidence, editorial clarity, whitespace, typography hierarchy, image scale and research-first feel.
- CIT differentiation: systems engineering, system maps, process flows, architecture diagrams, data visualisation, ASAESIS-style methodology and applied demonstrators.
- Conceptual architecture is a best-of benchmark model, not copied from one institution.
- V1 should look like a serious new center with a clear methodology and credible structure, not like an old organization with invented content.
- Bulgarian and English are required.
- Do not publish unconfirmed roles, partners, funding, results or projects.

## Files
00_README — this guide.
01_PRODUCT_BRIEF — purpose, audiences, positioning, goals and non-goals.
02_INFORMATION_ARCHITECTURE — sitemap, navigation, homepage sequence and templates.
03_DESIGN_SYSTEM — visual principles, HAI-inspired grammar and CIT differentiation.
04_BENCHMARK_REFERENCE_MAP — which benchmark informs which problem.
05_CONTENT_MODEL — structured content entities and truth rules.
06_COMPONENT_SPEC — reusable component families and page-section behavior.
07_BUILD_WORKFLOW — practical Codex + Cursor delivery process.
08_ACCEPTANCE_CRITERIA — release gates and quality bar.
09_AGENTS_MD — copy-ready repository instructions for AI coding agents.
10_CODEX_GOAL_MASTER_PROMPT — single end-to-end Codex /goal brief for the full V1 build.
11_CURSOR_GOAL_MASTER_PROMPT — single end-to-end Cursor Agent /goal brief for the full V1 build.

## Recommended implementation principle
AUTONOMOUS GOAL MODE: DESIGN → EVALUATE/SELECT → IMPLEMENT → SCREENSHOT → COMPARE → FIX → VERIFY → CONTINUE. Interactive review mode may substitute explicit human approval at design checkpoints.
Do not allow the coding agent to continuously redesign the site while implementing it.

## V1 scope
Primary navigation: About / Methodology / Projects / News / Insights / Team / Work with us, plus BG/EN. Insights is a real route with no homepage section.
Homepage (V1 Build Pack): Header → Hero → About (system idea, pillars, institutional network) → Methodology → News → Insights → Featured project → Team preview → Work with us → Footer.
Goal 2 (2026-09-07) homepage: Header → Hero → Why CIT / Core System Model → pillars → Institutional anchor → ASAESIS → Featured project → News → Team → Work with us → Footer. Insights stays in nav, not on the home scroll. See `docs/DESIGN_DECISIONS.md` §7.
Goal 3 (2026-09-07) navigation: About → Methodology → Projects → News → Insights → Team → Work with us. Homepage scroll-spy skips Insights.

## Live benchmark usage
04_BENCHMARK_REFERENCE_MAP contains the curated current representative-page URLs. They are navigation aids, not a crawl requirement. Stanford HAI is the primary visual north star; other benchmarks are task-specific functional/content references. The active coding agent should open the smallest relevant set of live pages only when resolving a concrete question, translate the useful principle into the single CIT design system, and record material reference influence in DESIGN_DECISIONS.md.
.

## Immediate next step
Use one clean starting folder/repo per implementation. For the Codex run, use 10_CODEX_GOAL_MASTER_PROMPT. For the Cursor run, use 11_CURSOR_GOAL_MASTER_PROMPT in Cursor Agent with /goal. In both cases, keep the same Build Pack, authoritative source documents, content truth rules, curated live references and Definition of Done so the two implementations remain directly comparable.
