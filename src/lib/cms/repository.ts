import "server-only";

import { insights as seedInsights } from "@/content/insights";
import { projects as seedProjects } from "@/content/projects";
import { cmsMode } from "./mode";
import { getLocalStore, updateLocalStore } from "./local-store";
import { recordContentSource } from "./content-source";
import { applyAnalysisInsights, analysisMediaNeededFor, missingAnalysisInsights } from "./analysis-overlay";
import { applyDevNewsFixtures, demoNewsMediaNeededFor, missingDevNewsFixtures } from "./dev-news-overlay";
import { applyMissingSeedContent, missingSeedContent } from "./seed-overlay";
import { insightToRecord, projectToRecord, recordToInsight, recordToPerson, recordToProject, seedMedia, seedPartners, seedSettings } from "./serialize";
import { canViewForPublic, isPublished, partnerIsPublic, personIsPublic, seoIncomplete, translationState, validateInsightPublish, validatePersonPublish, validateProjectPublish } from "./truth";
import type {
  DashboardStats,
  InsightRecord,
  MediaRecord,
  PartnerRecord,
  PersonRecord,
  ProjectRecord,
  PublicationState,
  SiteSettingsRecord,
  StaffRecord,
} from "./types";
import type { Insight, Person, Project } from "@/content/types";
import { getPreviewGrant, type PreviewGrant } from "@/lib/preview";
import { sortNewsNewestFirst } from "@/lib/news-order";
import { mediaPairMatches } from "@/lib/news-presentation";

function seedProjectRecords(): ProjectRecord[] {
  return seedProjects.map(projectToRecord);
}
function seedInsightRecords(): InsightRecord[] {
  return seedInsights.map(insightToRecord);
}

function missingEditorialOverlays(data: { insights: InsightRecord[]; media: MediaRecord[] }) {
  const seed = missingSeedContent(data);
  const withSeed = {
    insights: [...data.insights, ...seed.insights],
    media: [...data.media, ...seed.media],
  };
  const news = missingDevNewsFixtures(withSeed);
  const analyses = missingAnalysisInsights({
    insights: [...withSeed.insights, ...news.insights],
    media: [...withSeed.media, ...news.media],
  });
  return {
    insights: [...seed.insights, ...news.insights, ...analyses.insights],
    media: [...seed.media, ...news.media, ...analyses.media],
  };
}

function applyEditorialOverlays<T extends { insights: InsightRecord[]; media: MediaRecord[] }>(data: T): T {
  return applyAnalysisInsights(applyDevNewsFixtures(applyMissingSeedContent(data)));
}

function overlayMediaNeededFor(record: InsightRecord): MediaRecord[] {
  const byId = new Map<string, MediaRecord>();
  for (const item of [...demoNewsMediaNeededFor(record), ...analysisMediaNeededFor(record)]) {
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

async function persistMissingLocalOverlays() {
  const store = await getLocalStore();
  const extras = missingEditorialOverlays(store);
  if (!extras.insights.length && !extras.media.length) return applyEditorialOverlays(store);
  return applyEditorialOverlays(
    await updateLocalStore((data) => {
      for (const media of extras.media) {
        if (!data.media.some((item) => item.id === media.id)) data.media.push(media);
      }
      const analyses = extras.insights.filter((item) => item.id.startsWith("insight-analysis-"));
      const others = extras.insights.filter((item) => !item.id.startsWith("insight-analysis-"));
      for (const insight of [...analyses].reverse()) {
        if (!data.insights.some((item) => item.slug === insight.slug)) data.insights.unshift(insight);
      }
      for (const insight of others) {
        if (!data.insights.some((item) => item.slug === insight.slug)) data.insights.push(insight);
      }
    }),
  );
}

async function persistMissingOverlayMedia(record: InsightRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const needed = overlayMediaNeededFor(record);
  if (!needed.length) return { ok: true };
  const mode = cmsMode();
  if (mode === "local") {
    await updateLocalStore((data) => {
      for (const media of needed) {
        if (!data.media.some((item) => item.id === media.id)) data.media.push(media);
      }
    });
    return { ok: true };
  }
  if (mode === "supabase") {
    const { loadSupabaseRecords, saveSupabaseMedia } = await import("./supabase-repo");
    const current = await loadSupabaseRecords();
    for (const media of needed) {
      if (current.media.some((item) => item.id === media.id)) continue;
      const result = await saveSupabaseMedia(media);
      if (!result.ok) return result;
    }
  }
  return { ok: true };
}

export async function loadAllRecords(): Promise<{
  projects: ProjectRecord[];
  insights: InsightRecord[];
  people: PersonRecord[];
  partners: PartnerRecord[];
  media: MediaRecord[];
  settings: SiteSettingsRecord;
  staff: StaffRecord[];
}> {
  const mode = cmsMode();
  if (mode === "local") {
    recordContentSource("local");
    return persistMissingLocalOverlays();
  }
  if (mode === "supabase") {
    try {
      const { loadSupabaseRecords } = await import("./supabase-repo");
      const records = await loadSupabaseRecords();
      recordContentSource("supabase");
      return applyEditorialOverlays(records);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown CMS error";
      recordContentSource("seed-fallback", reason);
    }
  } else {
    recordContentSource("seed");
  }
  return applyEditorialOverlays({
    projects: seedProjectRecords(),
    insights: seedInsightRecords(),
    people: [],
    partners: seedPartners(),
    media: seedMedia(),
    settings: seedSettings(),
    staff: [],
  });
}

export async function listPublishedProjects(): Promise<Project[]> {
  const { projects } = await loadAllRecords();
  return projects.filter((p) => isPublished(p.publicationState)).map(recordToProject);
}

export async function listPublishedArticles(): Promise<Insight[]> {
  const { insights } = await loadAllRecords();
  return insights.filter((i) => isPublished(i.publicationState)).map(recordToInsight);
}

export async function listPublishedInsights(): Promise<Insight[]> {
  return (await listPublishedArticles()).filter((i) => i.type !== "news");
}

export async function listPublishedNews(): Promise<Insight[]> {
  return sortNewsNewestFirst((await listPublishedArticles()).filter((i) => i.type === "news"));
}

export async function getProjectForPublic(slug: string, preview?: PreviewGrant | null): Promise<Project | null> {
  const grant = preview === undefined ? await getPreviewGrant() : preview;
  const { projects } = await loadAllRecords();
  const record = projects.find((p) => p.slug === slug);
  if (!record) return null;
  if (!canViewForPublic(record.publicationState, grant, "project", slug)) return null;
  return recordToProject(record);
}

export async function getInsightForPublic(slug: string, preview?: PreviewGrant | null): Promise<Insight | null> {
  const grant = preview === undefined ? await getPreviewGrant() : preview;
  const { insights } = await loadAllRecords();
  const record = insights.find((i) => i.slug === slug);
  if (!record) return null;
  if (!canViewForPublic(record.publicationState, grant, "insight", slug)) return null;
  return recordToInsight(record);
}

export async function listPublicPeople(): Promise<Person[]> {
  const { people } = await loadAllRecords();
  return people.filter(personIsPublic).map(recordToPerson);
}

export async function listPublicPartners(): Promise<PartnerRecord[]> {
  const { partners } = await loadAllRecords();
  return partners.filter(partnerIsPublic);
}

export async function getSettings(): Promise<SiteSettingsRecord> {
  const { settings } = await loadAllRecords();
  return settings;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { projects, insights, people, partners, media } = await loadAllRecords();
  const all = [
    ...projects.map((p) => ({ kind: "project", slug: p.slug, title: p.titleEn || p.titleBg, updatedAt: p.updatedAt, bg: p.titleBg, en: p.titleEn, seo: p.seo, state: p.publicationState })),
    ...insights.map((i) => ({ kind: "insight", slug: i.slug, title: i.titleEn || i.titleBg, updatedAt: i.updatedAt, bg: i.titleBg, en: i.titleEn, seo: i.seo, state: i.publicationState })),
    ...people.map((p) => ({ kind: "person", slug: p.slug, title: p.nameEn || p.nameBg, updatedAt: p.updatedAt, bg: p.nameBg, en: p.nameEn, seo: p.seo, state: p.publicationState })),
    ...partners.map((p) => ({ kind: "partner", slug: p.slug, title: p.nameEn || p.nameBg, updatedAt: p.updatedAt, bg: p.nameBg, en: p.nameEn, seo: {}, state: p.publicationState })),
  ];
  const seoItems = [
    ...projects.map((p) => ({ bg: p.titleBg, en: p.titleEn, seo: p.seo })),
    ...insights.map((i) => ({ bg: i.titleBg, en: i.titleEn, seo: i.seo })),
  ];
  let missingEn = 0;
  let missingBg = 0;
  let incompleteSeo = 0;
  for (const item of all) {
    const tr = translationState(item.bg, item.en);
    if (tr === "en-missing" || tr === "both-missing") missingEn += 1;
    if (tr === "bg-missing" || tr === "both-missing") missingBg += 1;
  }
  for (const item of seoItems) {
    if (seoIncomplete(item.seo, item.bg, item.en)) incompleteSeo += 1;
  }
  return {
    draftProjects: projects.filter((p) => p.publicationState === "draft").length,
    draftInsights: insights.filter((i) => i.publicationState === "draft").length,
    awaitingReview: [...projects, ...insights, ...people].filter((x) => x.publicationState === "review").length,
    temporaryImages: media.filter((m) => m.temporary || m.replacementRequired).length,
    missingEn,
    missingBg,
    incompleteSeo,
    recentlyUpdated: all
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8)
      .map(({ kind, slug, title, updatedAt }) => ({ kind, slug, title, updatedAt })),
  };
}

export async function saveProject(record: ProjectRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  if (mode === "local") {
    await updateLocalStore((data) => {
      const idx = data.projects.findIndex((p) => p.id === record.id || p.slug === record.slug);
      record.updatedAt = new Date().toISOString();
      if (idx >= 0) data.projects[idx] = record;
      else data.projects.push(record);
    });
    return { ok: true };
  }
  const { saveSupabaseProject } = await import("./supabase-repo");
  return saveSupabaseProject(record);
}

export async function saveInsight(record: InsightRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  const mediaResult = await persistMissingOverlayMedia(record);
  if (!mediaResult.ok) return mediaResult;
  if (mode === "local") {
    await updateLocalStore((data) => {
      const idx = data.insights.findIndex((p) => p.id === record.id || p.slug === record.slug);
      record.updatedAt = new Date().toISOString();
      if (idx >= 0) data.insights[idx] = record;
      else data.insights.push(record);
    });
    return { ok: true };
  }
  const { saveSupabaseInsight } = await import("./supabase-repo");
  return saveSupabaseInsight(record);
}

export async function savePerson(record: PersonRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  if (mode === "local") {
    await updateLocalStore((data) => {
      const idx = data.people.findIndex((p) => p.id === record.id || p.slug === record.slug);
      record.updatedAt = new Date().toISOString();
      if (idx >= 0) data.people[idx] = record;
      else data.people.push(record);
    });
    return { ok: true };
  }
  const { saveSupabasePerson } = await import("./supabase-repo");
  return saveSupabasePerson(record);
}

export async function savePartner(record: PartnerRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  if (mode === "local") {
    await updateLocalStore((data) => {
      const idx = data.partners.findIndex((p) => p.id === record.id || p.slug === record.slug);
      record.updatedAt = new Date().toISOString();
      if (idx >= 0) data.partners[idx] = record;
      else data.partners.push(record);
    });
    return { ok: true };
  }
  const { saveSupabasePartner } = await import("./supabase-repo");
  return saveSupabasePartner(record);
}

export async function saveSettings(record: SiteSettingsRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  if (mode === "local") {
    await updateLocalStore((data) => {
      data.settings = { ...record, updatedAt: new Date().toISOString() };
    });
    return { ok: true };
  }
  const { saveSupabaseSettings } = await import("./supabase-repo");
  return saveSupabaseSettings(record);
}

export async function saveMedia(record: MediaRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = cmsMode();
  if (mode === "seed") return { ok: false, error: "CMS is read-only until local or Supabase credentials are configured." };
  if (mode === "local") {
    await updateLocalStore((data) => {
      const idx = data.media.findIndex((p) => p.id === record.id);
      record.updatedAt = new Date().toISOString();
      if (idx >= 0) data.media[idx] = record;
      else data.media.push(record);
    });
    return { ok: true };
  }
  const { saveSupabaseMedia } = await import("./supabase-repo");
  return saveSupabaseMedia(record);
}

export async function deleteMedia(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { projects, people, insights, settings, media } = await loadAllRecords();
  const used =
    projects.some((p) => p.heroMediaId === id) ||
    people.some((p) => p.photoMediaId === id) ||
    insights.some((i) => mediaPairMatches(i.heroMediaId, id) || i.bodyBg.includes(id) || i.bodyEn.includes(id)) ||
    settings.data.heroMediaId === id ||
    settings.data.institutionalMediaId === id ||
    settings.data.researchMediaId === id ||
    settings.data.appliedMediaId === id;
  if (used) return { ok: false, error: "This file is still referenced by content and cannot be deleted." };
  const mode = cmsMode();
  if (mode === "local") {
    const item = media.find((m) => m.id === id);
    if (!item) return { ok: false, error: "Not found." };
    await updateLocalStore((data) => {
      data.media = data.media.filter((m) => m.id !== id);
    });
    return { ok: true };
  }
  if (mode === "supabase") {
    const { deleteSupabaseMedia } = await import("./supabase-repo");
    return deleteSupabaseMedia(id);
  }
  return { ok: false, error: "CMS is read-only." };
}

export async function transitionProject(id: string, state: PublicationState, actor?: string): Promise<{ ok: true } | { ok: false; error: string; issues?: string[] }> {
  const { projects } = await loadAllRecords();
  const record = projects.find((p) => p.id === id || p.slug === id);
  if (!record) return { ok: false, error: "Project not found." };
  if (state === "published") {
    const issues = validateProjectPublish(record).filter((i) => i.blocking);
    if (issues.length) return { ok: false, error: "Publish blocked.", issues: issues.map((i) => i.message) };
    record.publishedAt = new Date().toISOString();
  }
  record.publicationState = state;
  record.updatedBy = actor;
  return saveProject(record);
}

export async function transitionInsight(id: string, state: PublicationState, actor?: string): Promise<{ ok: true } | { ok: false; error: string; issues?: string[] }> {
  const { insights } = await loadAllRecords();
  const record = insights.find((p) => p.id === id || p.slug === id);
  if (!record) return { ok: false as const, error: "Insight not found." };
  if (state === "published") {
    const issues = validateInsightPublish(record).filter((i) => i.blocking);
    if (issues.length) return { ok: false as const, error: "Publish blocked.", issues: issues.map((i) => i.message) };
    record.publishedAt = new Date().toISOString();
  }
  record.publicationState = state;
  record.updatedBy = actor;
  return saveInsight(record);
}

export async function transitionPerson(id: string, state: PublicationState, actor?: string): Promise<{ ok: true } | { ok: false; error: string; issues?: string[] }> {
  const { people } = await loadAllRecords();
  const record = people.find((p) => p.id === id || p.slug === id);
  if (!record) return { ok: false as const, error: "Person not found." };
  if (state === "published") {
    const issues = validatePersonPublish(record).filter((i) => i.blocking);
    if (issues.length) return { ok: false as const, error: "Publish blocked.", issues: issues.map((i) => i.message) };
    record.publishedAt = new Date().toISOString();
  }
  record.publicationState = state;
  record.updatedBy = actor;
  return savePerson(record);
}

export { recordToProject, recordToInsight };
