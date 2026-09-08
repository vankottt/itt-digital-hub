import { insights } from "@/content/insights";
import { people } from "@/content/people";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import type { Insight, Person, Project } from "@/content/types";
import { lifecycleFromStatus } from "./truth";
import type { InsightRecord, MediaRecord, PartnerRecord, PersonRecord, ProjectRecord, SiteSettingsRecord } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, slug: string): string {
  // Deterministic-enough ids for seed rows so re-import updates in place by slug.
  return `${prefix}-${slug}`;
}

export function projectToRecord(project: Project): ProjectRecord {
  const ts = nowIso();
  const { slug, featured, status, type, domain, methodologyName, title, standfirst, summary, related, relatedInsights, ...rest } = project;
  return {
    id: stableId("project", slug),
    slug,
    titleBg: title.bg,
    titleEn: title.en,
    summaryBg: summary.bg,
    summaryEn: summary.en,
    standfirstBg: standfirst.bg,
    standfirstEn: standfirst.en,
    status,
    lifecycle: lifecycleFromStatus(status),
    typeBg: type.bg,
    typeEn: type.en,
    domainBg: domain.bg,
    domainEn: domain.en,
    methodologyName,
    payload: rest as unknown as Record<string, unknown>,
    seo: {
      titleBg: title.bg,
      titleEn: title.en,
      descriptionBg: standfirst.bg,
      descriptionEn: standfirst.en,
    },
    publicationState: "published",
    featured: Boolean(featured),
    relatedProjectSlugs: related ?? [],
    relatedInsightSlugs: relatedInsights ?? [],
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  };
}

export function recordToProject(record: ProjectRecord): Project {
  const payload = record.payload as Omit<Project, "slug" | "featured" | "status" | "type" | "domain" | "methodologyName" | "title" | "standfirst" | "summary" | "related" | "relatedInsights">;
  return {
    slug: record.slug,
    featured: record.featured,
    status: record.status as Project["status"],
    type: { bg: record.typeBg, en: record.typeEn },
    domain: { bg: record.domainBg, en: record.domainEn },
    methodologyName: record.methodologyName,
    title: { bg: record.titleBg, en: record.titleEn },
    standfirst: { bg: record.standfirstBg, en: record.standfirstEn },
    summary: { bg: record.summaryBg, en: record.summaryEn },
    related: record.relatedProjectSlugs,
    relatedInsights: record.relatedInsightSlugs,
    ...payload,
  };
}

export function insightToRecord(insight: Insight): InsightRecord {
  const ts = nowIso();
  return {
    id: stableId("insight", insight.slug),
    slug: insight.slug,
    type: insight.type,
    titleBg: insight.title.bg,
    titleEn: insight.title.en,
    summaryBg: insight.summary.bg,
    summaryEn: insight.summary.en,
    bodyBg: insight.body.bg,
    bodyEn: insight.body.en,
    topicsBg: insight.topics.bg,
    topicsEn: insight.topics.en,
    relatedProjectSlugs: insight.relatedProjects ?? [],
    sourceBg: insight.source.bg,
    sourceEn: insight.source.en,
    date: insight.date,
    author: insight.author,
    heroMediaId: insight.heroMediaId,
    seo: {
      titleBg: insight.title.bg,
      titleEn: insight.title.en,
      descriptionBg: insight.summary.bg,
      descriptionEn: insight.summary.en,
    },
    publicationState: "published",
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  };
}

export function recordToInsight(record: InsightRecord): Insight {
  return {
    slug: record.slug,
    type: record.type === "news" ? "news" : "concept-note",
    title: { bg: record.titleBg, en: record.titleEn },
    summary: { bg: record.summaryBg, en: record.summaryEn },
    body: { bg: record.bodyBg, en: record.bodyEn },
    topics: { bg: record.topicsBg, en: record.topicsEn },
    relatedProjects: record.relatedProjectSlugs,
    source: { bg: record.sourceBg ?? "", en: record.sourceEn ?? "" },
    date: record.date,
    author: record.author,
    heroMediaId: record.heroMediaId,
  };
}

export function seedMedia(): MediaRecord[] {
  return [];
}

export function seedPartners(): PartnerRecord[] {
  return [];
}

export function seedPeopleRecords(): PersonRecord[] {
  const ts = nowIso();
  return people.map((p) => ({
    id: stableId("person", p.slug),
    slug: p.slug,
    kind: "appointed_person" as const,
    nameBg: p.name.bg,
    nameEn: p.name.en,
    roleBg: p.role?.bg,
    roleEn: p.role?.en,
    affiliationBg: p.affiliation?.bg,
    affiliationEn: p.affiliation?.en,
    expertiseBg: p.expertise.bg,
    expertiseEn: p.expertise.en,
    bioBg: p.bio.bg,
    bioEn: p.bio.en,
    relatedProjectSlugs: p.projects ?? [],
    relatedInsightSlugs: [],
    seo: {},
    publicationState: "draft" as const,
    createdAt: ts,
    updatedAt: ts,
  }));
}

export function recordToPerson(record: PersonRecord): Person {
  const seed = people.find((p) => p.slug === record.slug);
  return {
    slug: record.slug,
    name: { bg: record.nameBg, en: record.nameEn },
    role: record.roleBg && record.roleEn ? { bg: record.roleBg, en: record.roleEn } : undefined,
    affiliation: record.affiliationBg && record.affiliationEn ? { bg: record.affiliationBg, en: record.affiliationEn } : undefined,
    expertise: { bg: record.expertiseBg, en: record.expertiseEn },
    bio: { bg: record.bioBg, en: record.bioEn },
    projects: record.relatedProjectSlugs,
    portrait: seed?.portrait,
  };
}

export function seedSettings(): SiteSettingsRecord {
  return {
    id: "global",
    data: {
      nameBg: site.name.bg,
      nameEn: site.name.en,
      descriptorBg: site.descriptor.bg,
      descriptorEn: site.descriptor.en,
      anchorBg: site.anchor.bg,
      anchorEn: site.anchor.en,
      contactNoteBg: site.contactNote.bg,
      contactNoteEn: site.contactNote.en,
      featuredProjectSlug: projects.find((p) => p.featured)?.slug,
      featuredInsightSlugs: [],
      heroMediaId: undefined,
      institutionalMediaId: undefined,
      defaultSeo: {
        titleBg: site.name.bg,
        titleEn: site.name.en,
        descriptionBg: site.description.bg,
        descriptionEn: site.description.en,
      },
    },
    updatedAt: nowIso(),
  };
}

export function seedStore() {
  return {
    projects: projects.map(projectToRecord),
    insights: insights.map(insightToRecord),
    people: seedPeopleRecords(),
    partners: seedPartners(),
    media: seedMedia(),
    settings: seedSettings(),
    staff: [
      { userId: "staff-local-admin", email: "admin@itt.local", role: "admin" as const, displayName: "Local admin" },
      { userId: "staff-local-editor", email: "editor@itt.local", role: "editor" as const, displayName: "Local editor" },
    ],
  };
}
