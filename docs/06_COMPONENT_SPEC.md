# CIT WEBSITE — COMPONENT SPEC

## Goal
Use a small coherent component system. Avoid one-off layout code and avoid turning every content object into a generic card.

## 1. Global layout components
SiteHeader
- desktop navigation
- mobile menu
- language switch
- primary collaboration CTA
- sticky behavior only if it improves navigation and matches approved concept

## SiteFooter
- institutional anchor
- core navigation
- confirmed contact
- legal/privacy
- language/social links when real

## PageContainer
- consistent page gutters
- max-width rules
- responsive container behavior

## Section
- vertical rhythm primitive
- light/dark variants only when approved

## 2. Typography primitives
DisplayHeading
SectionHeading
BodyLead
BodyText
MetaText
TechnicalLabel
Quote / PullQuote when needed

## 3. Editorial components
EditorialHero
- headline
- support copy
- primary/secondary actions
- optional image/video/system visual
Variants must be explicitly designed, not improvised.

## EditorialSplit
- large text/media composition for research storytelling

## MediaFigure
- image / diagram / video
- caption
- source/credit

## InsightPreview
- title
- type
- date
- author
- summary/image variant

## 4. Systems components
SystemMap
- code-native semantic labels plus SVG/canvas visualization as appropriate
- accessible textual fallback
- responsive simplification

## MethodologyCycle
- explanatory sequence/feedback loop
- active/hover state where useful
- reduced-motion mode

## ProcessFlow
- ordered steps with dependencies
- not a decorative timeline

## ArchitectureDiagram
- layers, actors, flows or relationships
- must support real project/methodology content

## Metric/KPI visual
Use only when real data exists. No fake dashboard metrics.

## 5. Pillars component
IntegratedPillars
Education / Research / Applied Science must read as a connected operating model.
Avoid three identical SaaS feature cards unless the approved concept explicitly justifies such containment.

## 6. Project components
ProjectFeature
- editorial large-format featured project
- status/type/domain metadata
- system problem
- methodology signal
- visual

## ProjectListItem / ProjectCard
Choose one family after design approval.
Must support status, type, domain and image/diagram without becoming visually dense.

## ProjectMeta
Reusable metadata component.

## ProjectSection
Reusable detail-page section wrapper for Problem / Method / Evidence / Intervention / Results / Team / Partners / Outputs.

## 7. People
PeoplePreview
PersonList / PersonGrid — choose based on approved concept.
PersonPortrait
PersonExpertise
Do not over-emphasize hierarchy. Roles must come from confirmed content.

## 8. Partners / collaboration
PartnerStrip
- logos only when confirmed
- monochrome/neutral treatment preferred unless approved otherwise

## CollaborationRoutes
- public institution
- university/researcher
- business/industry
- funding/innovation
Should feel like clear entry points, not sales pricing cards.

## 9. Navigation/content discovery
TopicFilter
Use only if content volume justifies it.
ContentTypeFilter
Same rule.
Breadcrumb
Use on deeper pages if information architecture benefits.

## 10. Buttons/links
PrimaryButton
SecondaryButton
TextLink / ArrowLink
One icon family; no random Unicode arrows when a real icon component is required.

## 11. Interaction states
Every interactive component needs:
- hover
- focus-visible
- active/selected when applicable
- disabled when applicable
- keyboard behavior
- reduced-motion behavior where animation is used

## 12. Responsive rules
Each major component must define desktop, tablet and mobile behavior before it is considered production-ready.
Diagrams must have deliberate mobile versions rather than being scaled down until text is unreadable.

## 13. Component ownership
Suggested folders
components/layout
components/editorial
components/systems
components/projects
components/people
components/partners
components/ui

Keep page files as composition. Do not place a full homepage implementation in one monolithic component.

## 14. Anti-patterns
- giant all-purpose Card component used everywhere
- duplicated CSS per page
- component variants created only to patch visual drift
- hard-coded copy inside reusable components
- untyped content objects
- layout logic coupled to a single language
- decorative interaction without meaning
