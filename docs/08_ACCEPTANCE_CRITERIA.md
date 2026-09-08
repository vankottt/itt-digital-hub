# CIT WEBSITE — ACCEPTANCE CRITERIA

## Purpose
These are release gates for V1. A page is not done because it builds successfully.

## 1. Concept fidelity
- Visual language is recognizably CIT, not a Stanford clone.
- HAI influence appears through clarity, whitespace, typography, imagery and institutional tone.
- Systems/engineering differentiation is visible through real diagrams, process logic or structured visuals.
- No visual drift into generic AI startup, cyber/neon or university-portal aesthetics.

## 2. Homepage clarity
Within the first viewport / first 10 seconds, a new visitor can understand:
- this is the Center for Intelligent Technologies;
- it is research-led and interdisciplinary;
- it works on complex systems through systems thinking/engineering, data and intelligent technologies;
- there is a clear next action.

## 3. Information architecture
- Primary navigation matches the approved V1 IA.
- Every top-level section has enough real content to justify its existence.
- No empty “coming soon” sections in production unless explicitly approved.
- Detail pages cross-link coherently to related people/projects/insights where data exists.

## 4. Content truth
Zero tolerance for invented public facts.
No fabricated:
- formal roles;
- partners;
- funding;
- clients;
- measured results;
- publications;
- metrics.
Concepts, pilots and expected outcomes must be clearly labeled.

## 5. Bilingual quality
- BG and EN routes work consistently.
- No mixed-language UI unless intentionally required.
- Bulgarian wrapping is visually reviewed independently.
- Missing translations are not silently replaced with fake final copy.

## 6. Responsive quality
Reference viewports:
- 1440×1000
- 1280×800
- 768×1024
- 390×844
At each:
- no horizontal overflow;
- no clipped headings/buttons;
- diagrams remain understandable;
- navigation is usable;
- media crops remain intentional;
- section spacing remains coherent.

## 7. Accessibility
Target WCAG 2.2 AA behavior where practical.
Required:
- semantic page landmarks;
- logical heading structure;
- keyboard navigation;
- visible focus;
- sufficient color contrast;
- alt text for meaningful images;
- reduced-motion behavior;
- accessible menu interactions;
- textual explanation for complex diagrams.

## 8. Performance
V1 should remain lightweight.
Targets/guidance:
- avoid unnecessary client JS;
- optimize images;
- lazy-load below-the-fold heavy media;
- dynamically load genuinely heavy visualizations only when needed;
- no autoplay-heavy hero media without strong justification;
- prevent avoidable layout shift.
Use Lighthouse/Core Web Vitals as diagnostic tools, not as a reason to degrade visual quality blindly.

## 9. SEO / metadata
Each public page should have:
- unique title;
- description;
- canonical URL strategy;
- language/locale metadata as appropriate;
- Open Graph metadata;
- meaningful heading structure;
- indexability decision.
Structured data may be added only when semantically correct.

## 10. Technical quality
Before release:
- production build passes;
- typecheck passes;
- lint passes or documented justified exceptions exist;
- relevant tests pass;
- no recurring console errors;
- no dead primary navigation links;
- no placeholder assets accidentally ship;
- no secrets in repository/client bundle.

## 11. Visual verification
For every major approved surface:
- compare implementation screenshot with approved concept;
- record material mismatch;
- fix or explicitly accept deviation.
At least these should be visually reviewed:
- header/hero desktop;
- homepage methodology;
- featured project;
- mobile header/hero;
- one representative detail page.

## 12. Interaction quality
- Buttons/links have correct target/action.
- Mobile navigation works with keyboard/touch.
- Language switch preserves user context when practical.
- Filters, tabs or accordions exist only when useful and are fully functional.
- No inert controls or fake interactions.

## 13. Release content gate
Before production deployment, explicitly review all:
- people names and roles;
- partner logos;
- project statuses;
- contact information;
- institutional affiliation wording;
- funding statements;
- result claims.

## 14. Final release question
Would a strong research institution and a strong design agency both be comfortable attaching their name to this exact public surface?
If the answer is not clearly yes, the page is not finished.
