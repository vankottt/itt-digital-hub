# CIT WEBSITE — INFORMATION ARCHITECTURE

## Primary navigation
- About
- Methodology
- Projects
- News
- Insights
- Team (route remains `/people`)
- Work with us
- BG / EN

Confirmed Goal 3 (2026-09-07; supersedes the 2026-09-06 nav order): this order is shared by the header, footer and mobile menu in both locales. Work with us remains the collaboration CTA at the end of the strip.

Homepage document order (Goal 2) is unchanged. Primary nav now follows the homepage-mapped sequence so the scroll-spy indicator never moves backwards while scrolling down. Insights remains in navigation and at `/insights`, but has no homepage section and is therefore omitted from homepage scroll-spy (About → Methodology → Projects → News → Team → Work with us). Featured project precedes News.

## Principle
Keep V1 navigation compact, research-oriented and understandable to non-academic visitors. Do not create top-level items merely because content may exist later. **News** is a publishing channel for confirmed articles (text and video), including UASG materials republished with source.

## Homepage sequence
Goal 2 (2026-09-07) supersedes the V1/V2 homepage that placed Insights and a governance preview on the home scroll. Goal 3 (2026-09-07) supersedes the 2026-09-06 nav order so homepage-mapped items match document order.

1. Header — brand, navigation, language switch, collaboration CTA.
2. Hero — one clear proposition, short support copy, maximum two actions (infrastructure overlay; pause; reduced motion).
3. Why CIT / Core System Model — system idea and the signature `SystemLoop` diagram.
4. Education · Academic research · Applied science — compact three-column structural statement.
5. Institutional anchor — UASG only; planned agreement/council status lives on About, not here.
6. ASAESIS preview — desktop interactive ten-stage loop; compact homepage mobile index. Official method remains ten stages on `/methodology`.
7. Featured applied project — Wine × Tourism as Pilot concept, before News.
8. News — editorial CSS scroll-snap strip of confirmed articles; drafting fallback when an item has no legitimate media. No invented items.
9. Team preview — named people without invented CIT roles; one quiet future-profile slot.
10. Work with us — four audience entry rows; detail on `/work-with-us`. No invented inquiry inbox.
11. Footer — institutional anchor and legal/privacy links.

Insights remain a distinct public channel. Governance remains on About and Team.

## V1 sitemap
/
/about
/methodology
/projects
/projects/[slug]
/insights
/insights/[slug]
/news
/news/[slug]
/people
/people/[slug]
/work-with-us

Bulgarian and English must use one consistent internationalization strategy rather than two manually diverging page trees.

## Page templates

## About
- Mission and institutional context.
- Why the Center exists.
- Three pillars and their integrated operating model.
- Governance/structure only to the extent confirmed.
- Partners/network only when confirmed.

## Methodology
- Designed-systems premise.
- System components: goals, actors, roles, rules, decision points, information flows, incentives, feedback and outcomes.
- Mapping and process logic.
- Failure and bottleneck analysis.
- Target architecture and redesign.
- Implementation, measurement and adaptation.
- Role of AI, data and digital systems.
- Related projects and outputs.

## Project detail
- Title.
- Status / type / domain.
- System problem and context.
- Methodology.
- Data and evidence.
- System architecture or map.
- Failure hypotheses/findings.
- Intervention or prototype.
- Results versus expected outcomes — clearly distinguished.
- Team, partners and outputs.
- Related insights.

## Insights
Concept notes on the working framework. Public type: `concept-note`. They are not research publications.

## News
Confirmed articles and recordings, including UASG materials republished with source (whole-line YouTube URL in the same body model as Insights). Public type: `news`. Distinct from Insights. Named companies and municipalities in a UASG news item are not CIT partners.

## Team
Emphasize expertise and contribution rather than hierarchy. The public label is Team (Екип); the route remains `/people`. Person pages may include confirmed role, affiliation, expertise, short bio, projects, publications/insights and verified profile/contact links.

## Work with us
This is a collaboration-routing page, not a generic contact page. Potential modes include applied research, research collaboration, pilot/demonstrator, technology transfer, professional education and funded consortium work — but publish only modes the Center can genuinely support.

## Progressive disclosure
Homepage = clarity and orientation.
Landing pages = explanation and discovery.
Detail pages = evidence, methodology and depth.
Do not put the complete theoretical framework on the homepage.
