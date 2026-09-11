export type StaffRole = "admin" | "editor";
export type PublicationState = "draft" | "review" | "published" | "archived";
export type ProjectLifecycle = "concept" | "proposed" | "active" | "completed";
export type PartnerRelationship = "proposed" | "under_discussion" | "confirmed";
export type PersonKind = "planned_role" | "appointed_person";

export type CmsMode = "supabase" | "local" | "seed";

export interface StaffRecord {
  userId: string;
  email: string;
  role: StaffRole;
  displayName?: string;
}

export interface MediaRecord {
  id: string;
  storagePath?: string;
  publicUrl: string;
  title?: string;
  altBg: string;
  altEn: string;
  captionBg?: string;
  captionEn?: string;
  source?: string;
  sourceUrl?: string;
  usageNote?: string;
  copyrightNote?: string;
  temporary: boolean;
  replacementRequired: boolean;
  mimeType?: string;
  byteSize?: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SeoFields {
  titleBg?: string;
  titleEn?: string;
  descriptionBg?: string;
  descriptionEn?: string;
  ogTitleBg?: string;
  ogTitleEn?: string;
  ogDescriptionBg?: string;
  ogDescriptionEn?: string;
  image?: string;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  titleBg: string;
  titleEn: string;
  summaryBg: string;
  summaryEn: string;
  standfirstBg: string;
  standfirstEn: string;
  /** Public status vocabulary (pilot-concept, …). */
  status: string;
  lifecycle: ProjectLifecycle;
  typeBg: string;
  typeEn: string;
  domainBg: string;
  domainEn: string;
  methodologyName: string;
  heroMediaId?: string;
  payload: Record<string, unknown>;
  seo: SeoFields;
  publicationState: PublicationState;
  featured: boolean;
  relatedProjectSlugs: string[];
  relatedInsightSlugs: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface InsightRecord {
  id: string;
  slug: string;
  type: string;
  titleBg: string;
  titleEn: string;
  summaryBg: string;
  summaryEn: string;
  bodyBg: string[];
  bodyEn: string[];
  topicsBg: string[];
  topicsEn: string[];
  relatedProjectSlugs: string[];
  sourceBg?: string;
  sourceEn?: string;
  /** Source publication date (YYYY-MM-DD). Distinct from CMS publishedAt. */
  date?: string;
  author?: string;
  /** Media-library id for cards/hero. Presentation, not a publish gate. */
  heroMediaId?: string;
  seo: SeoFields;
  publicationState: PublicationState;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PersonRecord {
  id: string;
  slug: string;
  kind: PersonKind;
  nameBg: string;
  nameEn: string;
  roleBg?: string;
  roleEn?: string;
  affiliationBg?: string;
  affiliationEn?: string;
  expertiseBg: string[];
  expertiseEn: string[];
  bioBg: string[];
  bioEn: string[];
  photoMediaId?: string;
  relatedProjectSlugs: string[];
  relatedInsightSlugs: string[];
  seo: SeoFields;
  publicationState: PublicationState;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PartnerRecord {
  id: string;
  slug: string;
  nameBg: string;
  nameEn: string;
  relationship: PartnerRelationship;
  noteBg?: string;
  noteEn?: string;
  publicationState: PublicationState;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SiteSettingsRecord {
  id: "global";
  data: {
    nameBg: string;
    nameEn: string;
    descriptorBg: string;
    descriptorEn: string;
    anchorBg: string;
    anchorEn: string;
    contactNoteBg: string;
    contactNoteEn: string;
    featuredProjectSlug?: string;
    featuredInsightSlugs?: string[];
    heroMediaId?: string;
    institutionalMediaId?: string;
    researchMediaId?: string;
    appliedMediaId?: string;
    social?: Record<string, string>;
    defaultSeo?: SeoFields;
    homepage?: {
      heroPrimaryLabelBg?: string;
      heroPrimaryLabelEn?: string;
      heroSecondaryLabelBg?: string;
      heroSecondaryLabelEn?: string;
    };
  };
  updatedAt: string;
  updatedBy?: string;
}

export interface DashboardStats {
  draftProjects: number;
  draftInsights: number;
  awaitingReview: number;
  temporaryImages: number;
  missingEn: number;
  missingBg: number;
  incompleteSeo: number;
  recentlyUpdated: Array<{ kind: string; slug: string; title: string; updatedAt: string }>;
}

export type EntityKind = "project" | "insight" | "person" | "partner" | "media" | "settings";
