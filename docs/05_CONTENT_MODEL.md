# CIT WEBSITE — CONTENT MODEL

## Principle
Content must be structured independently from visual components so the site can later adopt a CMS without redesigning the information model.
For V1, content may live in typed local files/MDX/JSON, but fields should already follow a stable schema.

## 1. Project
Required fields
- id / slug
- title BG
- title EN
- short summary BG/EN
- status
- type
- domain
- start date if confirmed
- system problem
- context
- methodology summary
- data/evidence summary
- intervention/prototype summary
- results OR expected outcomes
- featured image/visual

## Optional fields
- system map
- process map
- partners
- team
- publications/outputs
- related insights
- funding source
- external links

## Status vocabulary — provisional
- Concept
- In development
- Active pilot
- Completed
Do not present this vocabulary as institutionally approved until confirmed.

## Critical rule
Expected outcomes and measured results must never be merged. A concept or active pilot cannot claim results it has not produced.

## 2. Insight
Fields
- slug
- title BG/EN
- type
- publication date
- author(s)
- summary
- body (line blocks: `## ` heading, `- ` list, whole-line YouTube URL, whole-line media-library id, otherwise paragraph)
- topics
- related projects
- hero/media
- source/references when relevant

## Possible types
Enabled public types: `concept-note` (Insights) and `news` (News). Other types from the original list (Research Note, Policy Brief, Report, Video-Lecture) stay unused until there is real content.

News is confirmed/stated-source material. Publishing a record with `type: news` requires bilingual title, bilingual summary, a source publication date, and a stated source in both languages. Author and card/hero media are stored when present; they are not required to publish. Public News lists are sorted newest source publication date first; equal dates use slug order. The homepage is a five-item latest-news preview, not the archive. Concept notes keep the existing title/summary rule and are not given News-only requirements.

Fictional News samples overlay until an editor saves them from `/admin`. They are not confirmed CIT news. Confirmed seed remains the UASG article only; `npm run seed` still does not import the samples. That article’s card/hero is a generated editorial photograph (`media-bulgarian-construction-game-editorial`); it is not the event and is not presented as Center photography. The Darachev infographic (`media-bulgarian-construction-game`) is a whole-line figure in the article body.

Three Insights analyses overlay the same way. They are concept notes with editorial diagrams, not research publications.

## 3. Person
Fields
- slug
- full name
- confirmed CIT role if any
- external/academic affiliation
- expertise areas
- short bio BG/EN
- portrait
- related projects
- related insights/publications
- verified external profile URLs
- verified contact details if intended for publication

Never infer formal CIT titles from expertise or project participation.

## 4. Partner / Network Organization
Fields
- name
- logo
- organization type
- collaboration type
- URL
- short description
- status: confirmed for public display / internal placeholder

Only confirmed-for-public-display organizations may render in production.

## 5. Research / Focus Area
Fields
- title BG/EN
- short explanation
- related methodology capabilities
- projects
- insights
- people
Do not create a large taxonomy in V1 unless real content supports it.

## 6. Methodology capability
This is preferable to pretending every visualized website step is an officially codified ASAESIS stage.
Possible fields:
- capability name
- purpose
- inputs
- activities
- outputs
- role of data/AI
- human role
- related project example

Candidate capabilities derived from the working concept:
- System Mapping
- Process / Algorithm Mapping
- Failure Analysis
- Target Architecture
- Scenario Analysis
- Intervention Design
- KPI / Feedback Monitoring
Exact public wording requires approval.

## 7. Collaboration route
Fields
- audience
- problems CIT can address
- collaboration modes
- what the partner contributes
- what CIT contributes
- next step / CTA
- contact route

## Candidate audiences
- Public institution
- University / researcher
- Business / industry
- Funding / innovation partner

## 8. Site settings
- official Center name BG/EN
- institutional affiliation text
- confirmed contact details
- language configuration
- social links
- legal/privacy links
- default SEO metadata

## 9. Localization rules
BG and EN are equal product surfaces, not automatic machine-translation fallbacks.
Content objects should share IDs/slugs where practical while storing localized text fields or locale-specific source files.
Do not publish untranslated placeholder English as final content.

## 10. Source traceability
For claims about the Center, maintain a source note internally where practical:
- Action Plan
- confirmed meeting/email decision
- approved project document
- approved website copy
This is especially important for partner, funding, result and governance claims.
