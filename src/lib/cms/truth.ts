import type { InsightRecord, PersonRecord, PartnerRecord, ProjectLifecycle, ProjectRecord, PublicationState } from "./types";

export function lifecycleFromStatus(status: string): ProjectLifecycle {
  switch (status) {
    case "pilot-concept":
      return "concept";
    case "proposed-mandate":
    case "in-development":
      return "proposed";
    case "active-pilot":
    case "production":
    case "previous-professional":
    case "client-project":
      return "active";
    case "internal-rd":
      return "concept";
    case "completed":
      return "completed";
    case "concept":
    case "proposed":
    case "active":
      return status;
    default:
      return "concept";
  }
}

export function isNonEmptyText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function arrayHasContent(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((item) => {
    if (typeof item === "string") return item.trim().length > 0;
    return item != null;
  });
}

function payloadMeasured(payload: Record<string, unknown>): boolean {
  const measured = payload.measuredResults;
  if (!measured || typeof measured !== "object") return false;
  const rec = measured as { bg?: unknown; en?: unknown };
  return arrayHasContent(rec.bg) || arrayHasContent(rec.en);
}

export interface PublishIssue {
  code: string;
  message: string;
  blocking: boolean;
}

export function validateProjectPublish(project: ProjectRecord): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (!isNonEmptyText(project.titleBg) || !isNonEmptyText(project.titleEn)) {
    issues.push({ code: "title", message: "Both BG and EN titles are required to publish.", blocking: true });
  }
  if (!isNonEmptyText(project.standfirstBg) || !isNonEmptyText(project.standfirstEn)) {
    issues.push({ code: "standfirst", message: "Both BG and EN standfirsts are required to publish.", blocking: true });
  }
  if ((project.lifecycle === "concept" || project.lifecycle === "proposed") && payloadMeasured(project.payload)) {
    issues.push({
      code: "measured-on-concept",
      message: "Concept/proposed projects cannot publish measured results. Clear measured results or change lifecycle after review.",
      blocking: true,
    });
  }
  if (project.lifecycle === "completed" && !payloadMeasured(project.payload)) {
    issues.push({
      code: "completed-without-results",
      message: "Completed projects should record measured results, or stay in another lifecycle.",
      blocking: false,
    });
  }
  return issues;
}

export function validateInsightPublish(insight: InsightRecord): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (!isNonEmptyText(insight.titleBg) || !isNonEmptyText(insight.titleEn)) {
    issues.push({ code: "title", message: "Both BG and EN titles are required to publish.", blocking: true });
  }
  if (!isNonEmptyText(insight.summaryBg) || !isNonEmptyText(insight.summaryEn)) {
    issues.push({ code: "summary", message: "Both BG and EN summaries are required to publish.", blocking: true });
  }
  if (insight.type === "news") {
    if (!isNonEmptyText(insight.date)) {
      issues.push({
        code: "news-date",
        message: "News requires a source publication date before it can be published.",
        blocking: true,
      });
    }
    if (!isNonEmptyText(insight.sourceBg) || !isNonEmptyText(insight.sourceEn)) {
      issues.push({
        code: "news-source",
        message: "News requires a stated source in both BG and EN before it can be published.",
        blocking: true,
      });
    }
  }
  return issues;
}

export function validatePersonPublish(person: PersonRecord): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (person.kind === "planned_role") {
    issues.push({
      code: "planned-role",
      message: "Planned roles cannot be published as named public profiles.",
      blocking: true,
    });
  }
  if (!isNonEmptyText(person.nameBg) || !isNonEmptyText(person.nameEn)) {
    issues.push({ code: "name", message: "Both BG and EN names are required to publish.", blocking: true });
  }
  if (!isNonEmptyText(person.roleBg) || !isNonEmptyText(person.roleEn)) {
    issues.push({ code: "role", message: "A confirmed role in both languages is required to publish a person.", blocking: true });
  }
  return issues;
}

export function partnerIsPublic(partner: PartnerRecord): boolean {
  return partner.publicationState === "published" && partner.relationship === "confirmed";
}

export function personIsPublic(person: PersonRecord): boolean {
  return person.publicationState === "published" && person.kind === "appointed_person";
}

export function isPublished(state: PublicationState): boolean {
  return state === "published";
}

export function canViewForPublic(
  state: PublicationState,
  preview: { kind: string; slug: string } | null | undefined,
  kind: "project" | "insight",
  slug: string,
): boolean {
  if (isPublished(state)) return true;
  return preview?.kind === kind && preview.slug === slug;
}

export function translationState(bg: string, en: string): "both" | "bg-missing" | "en-missing" | "both-missing" {
  const hasBg = isNonEmptyText(bg);
  const hasEn = isNonEmptyText(en);
  if (hasBg && hasEn) return "both";
  if (hasBg) return "en-missing";
  if (hasEn) return "bg-missing";
  return "both-missing";
}

export function seoIncomplete(seo: { titleBg?: string; titleEn?: string; descriptionBg?: string; descriptionEn?: string }, titleBg: string, titleEn: string): boolean {
  const tBg = seo.titleBg || titleBg;
  const tEn = seo.titleEn || titleEn;
  return !isNonEmptyText(tBg) || !isNonEmptyText(tEn) || !isNonEmptyText(seo.descriptionBg) || !isNonEmptyText(seo.descriptionEn);
}
