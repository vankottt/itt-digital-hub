import type { L } from "@/lib/i18n";

/* ------------------------------------------------------------------
   Content model (see docs/05_CONTENT_MODEL.md). Text fields are
   localized with L<T>; ids/slugs are shared across locales.
   ------------------------------------------------------------------ */

/** Public status vocabulary. Unknown facts stay on TODO markers, not in these labels. */
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
  /** System problem and context — paragraphs. */
  systemProblem: L<string[]>;
  /** Observable symptoms / factors listed in the source. */
  symptoms?: L<string[]>;
  /** Central question the project must answer. */
  question?: L;
  objective: L<string[]>;
  objectiveItems?: L<string[]>;
  scope?: {
    intro: L;
    chain?: L<string[]>;
    items: L<string[]>;
    note?: L;
  };
  methodology: {
    intro: L;
    stages: Stage[];
  };
  dataEvidence?: L<string[]>;
  /** Stakeholder groups analysed by the project (not partners). */
  stakeholders?: { intro: L; groups: L<string[]> };
  targetArchitecture?: { intro: L; relation?: L<string[]>; components: L<string[]> };
  /** Intended deliverables. */
  outputs?: { intro: L; items: Deliverable[] };
  /** Expected outcomes — never measured results. */
  expectedOutcomes?: L<string[]>;
  /** Measured results — empty in V1 by definition. */
  measuredResults?: L<string[]>;
  validation?: { intro: L; loop: L<string[]>; indicators?: L<string[]> };
  successCriteria?: L<string[]>;
  variants?: Array<{ title: L; body: L; duration: L }>;
  followUp?: L<string[]>;
  /** Who the work is proposed to — an addressee, not a confirmed partner. */
  proposedTo?: L;
  statusNote: L;
  sourceNote: L;
  related?: string[];
  relatedInsights?: string[];
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
  /** Confirmed public role only. */
  role?: L;
  affiliation?: L;
  expertise: L<string[]>;
  bio: L<string[]>;
  projects?: string[];
  /** Verified external profile URLs only. LinkedIn is rendered as an icon in the team grid. */
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
