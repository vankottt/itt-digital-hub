import type { InsightRecord, PersonRecord, ProjectRecord, SeoFields } from "./types";

export function formHas(form: FormData, key: string): boolean {
  return form.has(key);
}

export function overlayText(form: FormData, key: string, fallback = ""): string {
  if (!formHas(form, key)) return fallback;
  return String(form.get(key) ?? "");
}

export function overlayOptional(form: FormData, key: string, fallback?: string): string | undefined {
  if (!formHas(form, key)) return fallback;
  const value = String(form.get(key) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

export function overlayLines(form: FormData, key: string, fallback: string[] = []): string[] {
  if (!formHas(form, key)) return fallback;
  return String(form.get(key) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function overlaySeo(form: FormData, existing?: SeoFields): SeoFields {
  return {
    titleBg: overlayOptional(form, "seoTitleBg", existing?.titleBg),
    titleEn: overlayOptional(form, "seoTitleEn", existing?.titleEn),
    descriptionBg: overlayOptional(form, "seoDescriptionBg", existing?.descriptionBg),
    descriptionEn: overlayOptional(form, "seoDescriptionEn", existing?.descriptionEn),
  };
}

function insightType(value: string | undefined): InsightRecord["type"] {
  return value === "news" ? "news" : "concept-note";
}

export function insightRecordFromForm(
  form: FormData,
  existing: InsightRecord | undefined,
  actorId: string,
  now = new Date().toISOString(),
): InsightRecord {
  const slug = overlayText(form, "slug", existing?.slug ?? "");
  const id = overlayText(form, "id", existing?.id ?? "") || `insight-${slug}`;
  return {
    id,
    slug,
    type: insightType(overlayText(form, "type", existing?.type)),
    titleBg: overlayText(form, "titleBg", existing?.titleBg ?? ""),
    titleEn: overlayText(form, "titleEn", existing?.titleEn ?? ""),
    summaryBg: overlayText(form, "summaryBg", existing?.summaryBg ?? ""),
    summaryEn: overlayText(form, "summaryEn", existing?.summaryEn ?? ""),
    bodyBg: overlayLines(form, "bodyBg", existing?.bodyBg ?? []),
    bodyEn: overlayLines(form, "bodyEn", existing?.bodyEn ?? []),
    topicsBg: overlayLines(form, "topicsBg", existing?.topicsBg ?? []),
    topicsEn: overlayLines(form, "topicsEn", existing?.topicsEn ?? []),
    relatedProjectSlugs: overlayLines(form, "relatedProjects", existing?.relatedProjectSlugs ?? []),
    sourceBg: overlayOptional(form, "sourceBg", existing?.sourceBg),
    sourceEn: overlayOptional(form, "sourceEn", existing?.sourceEn),
    date: overlayOptional(form, "date", existing?.date),
    author: overlayOptional(form, "author", existing?.author),
    heroMediaId: overlayOptional(form, "heroMediaId", existing?.heroMediaId),
    seo: overlaySeo(form, existing?.seo),
    publicationState: existing?.publicationState ?? "draft",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt: existing?.publishedAt,
    createdBy: existing?.createdBy ?? actorId,
    updatedBy: actorId,
  };
}

export function personRecordFromForm(
  form: FormData,
  existing: PersonRecord | undefined,
  actorId: string,
  now = new Date().toISOString(),
): PersonRecord {
  const slug = overlayText(form, "slug", existing?.slug ?? "");
  const kind = overlayText(form, "kind", existing?.kind ?? "appointed_person");
  return {
    id: overlayText(form, "id", existing?.id ?? "") || `person-${slug}`,
    slug,
    kind: kind === "planned_role" ? "planned_role" : "appointed_person",
    nameBg: overlayText(form, "nameBg", existing?.nameBg ?? ""),
    nameEn: overlayText(form, "nameEn", existing?.nameEn ?? ""),
    roleBg: overlayOptional(form, "roleBg", existing?.roleBg),
    roleEn: overlayOptional(form, "roleEn", existing?.roleEn),
    affiliationBg: overlayOptional(form, "affiliationBg", existing?.affiliationBg),
    affiliationEn: overlayOptional(form, "affiliationEn", existing?.affiliationEn),
    expertiseBg: overlayLines(form, "expertiseBg", existing?.expertiseBg ?? []),
    expertiseEn: overlayLines(form, "expertiseEn", existing?.expertiseEn ?? []),
    bioBg: overlayLines(form, "bioBg", existing?.bioBg ?? []),
    bioEn: overlayLines(form, "bioEn", existing?.bioEn ?? []),
    photoMediaId: overlayOptional(form, "photoMediaId", existing?.photoMediaId),
    relatedProjectSlugs: overlayLines(form, "relatedProjects", existing?.relatedProjectSlugs ?? []),
    relatedInsightSlugs: overlayLines(form, "relatedInsights", existing?.relatedInsightSlugs ?? []),
    seo: overlaySeo(form, existing?.seo),
    publicationState: existing?.publicationState ?? "draft",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt: existing?.publishedAt,
    createdBy: existing?.createdBy ?? actorId,
    updatedBy: actorId,
  };
}

export function projectRecordFromForm(
  form: FormData,
  existing: ProjectRecord | undefined,
  actorId: string,
  now = new Date().toISOString(),
): ProjectRecord {
  const slug = overlayText(form, "slug", existing?.slug ?? "");
  const payload = existing?.payload ?? {};
  return {
    id: overlayText(form, "id", existing?.id ?? "") || `project-${slug}`,
    slug,
    titleBg: overlayText(form, "titleBg", existing?.titleBg ?? ""),
    titleEn: overlayText(form, "titleEn", existing?.titleEn ?? ""),
    summaryBg: overlayText(form, "summaryBg", existing?.summaryBg ?? ""),
    summaryEn: overlayText(form, "summaryEn", existing?.summaryEn ?? ""),
    standfirstBg: overlayText(form, "standfirstBg", existing?.standfirstBg ?? ""),
    standfirstEn: overlayText(form, "standfirstEn", existing?.standfirstEn ?? ""),
    status: overlayText(form, "status", existing?.status ?? "pilot-concept") || "pilot-concept",
    lifecycle: (overlayText(form, "lifecycle", existing?.lifecycle ?? "concept") as ProjectRecord["lifecycle"]) || "concept",
    typeBg: overlayText(form, "typeBg", existing?.typeBg ?? ""),
    typeEn: overlayText(form, "typeEn", existing?.typeEn ?? ""),
    domainBg: overlayText(form, "domainBg", existing?.domainBg ?? ""),
    domainEn: overlayText(form, "domainEn", existing?.domainEn ?? ""),
    methodologyName: overlayText(form, "methodologyName", existing?.methodologyName ?? "Understand · Design · Build") || "Understand · Design · Build",
    heroMediaId: overlayOptional(form, "heroMediaId", existing?.heroMediaId),
    payload: {
      ...payload,
      ...(formHas(form, "systemProblemBg") || formHas(form, "systemProblemEn")
        ? {
            systemProblem: {
              bg: overlayLines(form, "systemProblemBg", Array.isArray((payload.systemProblem as { bg?: string[] } | undefined)?.bg) ? (payload.systemProblem as { bg: string[] }).bg : []),
              en: overlayLines(form, "systemProblemEn", Array.isArray((payload.systemProblem as { en?: string[] } | undefined)?.en) ? (payload.systemProblem as { en: string[] }).en : []),
            },
          }
        : {}),
      ...(formHas(form, "objectiveBg") || formHas(form, "objectiveEn")
        ? {
            objective: {
              bg: overlayLines(form, "objectiveBg", Array.isArray((payload.objective as { bg?: string[] } | undefined)?.bg) ? (payload.objective as { bg: string[] }).bg : []),
              en: overlayLines(form, "objectiveEn", Array.isArray((payload.objective as { en?: string[] } | undefined)?.en) ? (payload.objective as { en: string[] }).en : []),
            },
          }
        : {}),
      ...(formHas(form, "expectedBg") || formHas(form, "expectedEn")
        ? {
            expectedOutcomes: {
              bg: overlayLines(form, "expectedBg", Array.isArray((payload.expectedOutcomes as { bg?: string[] } | undefined)?.bg) ? (payload.expectedOutcomes as { bg: string[] }).bg : []),
              en: overlayLines(form, "expectedEn", Array.isArray((payload.expectedOutcomes as { en?: string[] } | undefined)?.en) ? (payload.expectedOutcomes as { en: string[] }).en : []),
            },
          }
        : {}),
      ...(formHas(form, "measuredBg") || formHas(form, "measuredEn")
        ? {
            measuredResults: {
              bg: overlayLines(form, "measuredBg", Array.isArray((payload.measuredResults as { bg?: string[] } | undefined)?.bg) ? (payload.measuredResults as { bg: string[] }).bg : []),
              en: overlayLines(form, "measuredEn", Array.isArray((payload.measuredResults as { en?: string[] } | undefined)?.en) ? (payload.measuredResults as { en: string[] }).en : []),
            },
          }
        : {}),
    },
    seo: overlaySeo(form, existing?.seo),
    publicationState: existing?.publicationState ?? "draft",
    featured: formHas(form, "featuredSubmitted") ? form.get("featured") === "on" : Boolean(existing?.featured),
    relatedProjectSlugs: overlayLines(form, "relatedProjects", existing?.relatedProjectSlugs ?? []),
    relatedInsightSlugs: overlayLines(form, "relatedInsights", existing?.relatedInsightSlugs ?? []),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt: existing?.publishedAt,
    createdBy: existing?.createdBy ?? actorId,
    updatedBy: actorId,
  };
}
