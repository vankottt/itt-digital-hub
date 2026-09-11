import type { L } from "@/lib/i18n";

/* ------------------------------------------------------------------
   Content model (see docs/05_CONTENT_MODEL.md). Text fields are
   localized with L<T>; ids/slugs are shared across locales.
   ------------------------------------------------------------------ */

export type ProjectStatus =
  | "pilot-concept"
  | "proposed-mandate"
  | "in-development"
  | "active-pilot"
  | "completed"
  | "production"
  | "internal-rd"
  | "previous-professional"
  | "client-project";

export interface Stage {
  code: string;
  /** Short name used in diagrams. */
  short: L;
  /** Full stage title. */
  title: L;
  body: L;
  /** Optional detail list (criteria, package contents). */
  items?: L<string[]>;
}

export interface Deliverable {
  title: L;
  body: L;
}

export interface StorySection {
  heading: L;
  body: L<string[]>;
  items?: L<string[]>;
  steps?: L<string[]>;
  quote?: L;
}

export interface ProjectStory {
  challenge: StorySection;
  built: StorySection;
  howItWorks?: StorySection;
  /** Optional extra story blocks. Unused sections stay omitted. */
  extras?: StorySection[];
  value?: StorySection;
  outcome: StorySection;
}

export interface Project {
  slug: string;
  featured?: boolean;
  status: ProjectStatus;
  type: L;
  domain: L;
  methodologyName: L;
  title: L;
  standfirst: L;
  summary: L;
  tags: L<string[]>;
  proofPoint?: L;
  cta: L;
  story: ProjectStory;
  /** Retained for CMS records; not rendered on public story pages. */
  systemProblem?: L<string[]>;
  symptoms?: L<string[]>;
  question?: L;
  objective?: L<string[]>;
  objectiveItems?: L<string[]>;
  scope?: {
    intro: L;
    chain?: L<string[]>;
    items: L<string[]>;
    note?: L;
  };
  methodology?: {
    intro: L;
    stages: Stage[];
  };
  dataEvidence?: L<string[]>;
  stakeholders?: { intro: L; groups: L<string[]> };
  targetArchitecture?: { intro: L; relation?: L<string[]>; components: L<string[]> };
  outputs?: { intro: L; items: Deliverable[] };
  expectedOutcomes?: L<string[]>;
  measuredResults?: L<string[]>;
  validation?: { intro: L; loop: L<string[]>; indicators?: L<string[]> };
  successCriteria?: L<string[]>;
  variants?: Array<{ title: L; body: L; duration: L }>;
  followUp?: L<string[]>;
  proposedTo?: L;
  statusNote?: L;
  sourceNote?: L;
  related?: string[];
  relatedInsights?: string[];
  proposition?: L;
  intelligence?: { body: L<string[]> };
  measuredAreas?: { intro: L; items: L<string[]>; note: L };
  seo?: {
    documentTitle: L;
    description: L;
    ogTitle: L;
    ogDescription: L;
    image: string;
  };
}

/** `concept-note` appears under Insights; `news` under News. Same body model (text + YouTube). */
export type InsightType = "concept-note" | "news";

export interface Insight {
  slug: string;
  type: InsightType;
  title: L;
  summary: L;
  /** Lightweight blocks: "## " heading, "- " list, whole-line YouTube URL, otherwise paragraph. */
  body: L<string[]>;
  topics: L<string[]>;
  relatedProjects?: string[];
  source: L;
  /** Source publication date (YYYY-MM-DD). Optional on concept notes; required to publish news. */
  date?: string;
  /** Optional credited author. Institutional news may omit this. */
  author?: string;
  /** Media-library id when a card/hero image is chosen. Not required to publish. */
  heroMediaId?: string;
  /** Internal marker for unused demonstration samples. */
  devFixture?: boolean;
}

export interface Person {
  slug: string;
  name: L;
  /** Homepage / team-card eyebrow. Independent of the confirmed role title. */
  axis?: L;
  /** Confirmed public role only. */
  role?: L;
  affiliation?: L;
  expertise: L<string[]>;
  /** Longer first-person profile for About / People. */
  bio: L<string[]>;
  /** Short first-person copy for homepage team cards. About / People uses `bio`. */
  cardBio?: L<string[]>;
  projects?: string[];
  /** Verified external profile URLs only. LinkedIn is not rendered on public profiles. */
  links?: Array<{ label: string; url: string }>;
  /** Colour photograph; cropped to a circle in CSS. */
  portrait?: {
    src: string;
    width: number;
    height: number;
    /** CSS object-position for the circular crop. */
    objectPosition?: string;
  };
}

export interface GovernanceFunction {
  code: string;
  title: L;
  body: L;
  items?: L<string[]>;
}

export interface CollaborationRoute {
  slug: string;
  code: string;
  audience: L;
  audienceExamples: L<string[]>;
  problems: L<string[]>;
  modes: L<string[]>;
  partnerBrings: L<string[]>;
  weBring: L<string[]>;
}

export interface Pillar {
  code: string;
  slug: "education" | "research" | "applied";
  title: L;
  short: L;
  purpose: L;
  activities: L<string[]>;
  expected: L<string[]>;
}
