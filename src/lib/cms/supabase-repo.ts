import "server-only";

import { projects as seedProjects } from "@/content/projects";
import { createSupabaseServerClient } from "./supabase-server";
import { projectToRecord } from "./serialize";
import type { InsightRecord, MediaRecord, PartnerRecord, PersonRecord, ProjectRecord, SiteSettingsRecord, StaffRecord } from "./types";

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function uuidOrNull(value?: string | null): string | null {
  if (!value) return null;
  return uuidRe.test(value) ? value : null;
}

function mergeSeedProjectPayload(records: ProjectRecord[]): ProjectRecord[] {
  const seedBySlug = new Map(seedProjects.map((project) => [project.slug, projectToRecord(project)]));
  return records.map((record) => {
    const seed = seedBySlug.get(record.slug);
    if (!seed) return record;
    const empty = !record.payload || Object.keys(record.payload).length === 0;
    return empty ? { ...record, payload: seed.payload } : record;
  });
}

function mapProject(row: Record<string, unknown>): ProjectRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titleBg: String(row.title_bg ?? ""),
    titleEn: String(row.title_en ?? ""),
    summaryBg: String(row.summary_bg ?? ""),
    summaryEn: String(row.summary_en ?? ""),
    standfirstBg: String(row.standfirst_bg ?? ""),
    standfirstEn: String(row.standfirst_en ?? ""),
    status: String(row.status ?? "pilot-concept"),
    lifecycle: (row.lifecycle as ProjectRecord["lifecycle"]) ?? "concept",
    typeBg: String(row.type_bg ?? ""),
    typeEn: String(row.type_en ?? ""),
    domainBg: String(row.domain_bg ?? ""),
    domainEn: String(row.domain_en ?? ""),
    methodologyName: String(row.methodology_name ?? "Understand · Design · Build"),
    heroMediaId: row.hero_media_id ? String(row.hero_media_id) : undefined,
    payload: (row.payload as Record<string, unknown>) ?? {},
    seo: (row.seo as ProjectRecord["seo"]) ?? {},
    publicationState: (row.publication_state as ProjectRecord["publicationState"]) ?? "draft",
    featured: Boolean(row.featured),
    relatedProjectSlugs: (row.related_project_slugs as string[]) ?? [],
    relatedInsightSlugs: (row.related_insight_slugs as string[]) ?? [],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function projectRow(record: ProjectRecord) {
  return {
    id: record.id,
    slug: record.slug,
    title_bg: record.titleBg,
    title_en: record.titleEn,
    summary_bg: record.summaryBg,
    summary_en: record.summaryEn,
    standfirst_bg: record.standfirstBg,
    standfirst_en: record.standfirstEn,
    status: record.status,
    lifecycle: record.lifecycle,
    type_bg: record.typeBg,
    type_en: record.typeEn,
    domain_bg: record.domainBg,
    domain_en: record.domainEn,
    methodology_name: record.methodologyName,
    hero_media_id: record.heroMediaId ?? null,
    payload: record.payload,
    seo: record.seo,
    publication_state: record.publicationState,
    featured: record.featured,
    related_project_slugs: record.relatedProjectSlugs,
    related_insight_slugs: record.relatedInsightSlugs,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    published_at: record.publishedAt ?? null,
    created_by: uuidOrNull(record.createdBy),
    updated_by: uuidOrNull(record.updatedBy),
  };
}

export async function loadSupabaseRecords() {
  const supabase = await createSupabaseServerClient();
  const [projects, insights, people, partners, media, settings, staff] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("insights").select("*"),
    supabase.from("people").select("*"),
    supabase.from("partners").select("*"),
    supabase.from("media").select("*"),
    supabase.from("site_settings").select("*").eq("id", "global").maybeSingle(),
    supabase.from("staff").select("*"),
  ]);
  const err = projects.error || insights.error || people.error || partners.error || media.error || settings.error || staff.error;
  if (err) throw err;

  return {
    projects: mergeSeedProjectPayload((projects.data ?? []).map((row) => mapProject(row as Record<string, unknown>))),
    insights: (insights.data ?? []).map((row) => mapInsight(row as Record<string, unknown>)),
    people: (people.data ?? []).map((row) => mapPerson(row as Record<string, unknown>)),
    partners: (partners.data ?? []).map((row) => mapPartner(row as Record<string, unknown>)),
    media: (media.data ?? []).map((row) => mapMedia(row as Record<string, unknown>)),
    settings: settings.data ? mapSettings(settings.data as Record<string, unknown>) : fallbackSettings(),
    staff: (staff.data ?? []).map((row) => mapStaff(row as Record<string, unknown>)),
  };
}

function fallbackSettings(): SiteSettingsRecord {
  return {
    id: "global",
    data: {
      nameBg: "ITT Digital Hub",
      nameEn: "ITT Digital Hub",
      descriptorBg: "",
      descriptorEn: "",
      anchorBg: "",
      anchorEn: "",
      contactNoteBg: "",
      contactNoteEn: "",
    },
    updatedAt: new Date().toISOString(),
  };
}

function mapInsight(row: Record<string, unknown>): InsightRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    type: String(row.type ?? "concept-note"),
    titleBg: String(row.title_bg ?? ""),
    titleEn: String(row.title_en ?? ""),
    summaryBg: String(row.summary_bg ?? ""),
    summaryEn: String(row.summary_en ?? ""),
    bodyBg: (row.body_bg as string[]) ?? [],
    bodyEn: (row.body_en as string[]) ?? [],
    topicsBg: (row.topics_bg as string[]) ?? [],
    topicsEn: (row.topics_en as string[]) ?? [],
    relatedProjectSlugs: (row.related_project_slugs as string[]) ?? [],
    sourceBg: row.source_bg ? String(row.source_bg) : undefined,
    sourceEn: row.source_en ? String(row.source_en) : undefined,
    date: row.published_on ? String(row.published_on) : undefined,
    author: row.author ? String(row.author) : undefined,
    heroMediaId: row.hero_media_id ? String(row.hero_media_id) : undefined,
    seo: (row.seo as InsightRecord["seo"]) ?? {},
    publicationState: (row.publication_state as InsightRecord["publicationState"]) ?? "draft",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function mapPerson(row: Record<string, unknown>): PersonRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    kind: (row.kind as PersonRecord["kind"]) ?? "appointed_person",
    nameBg: String(row.name_bg ?? ""),
    nameEn: String(row.name_en ?? ""),
    roleBg: row.role_bg ? String(row.role_bg) : undefined,
    roleEn: row.role_en ? String(row.role_en) : undefined,
    affiliationBg: row.affiliation_bg ? String(row.affiliation_bg) : undefined,
    affiliationEn: row.affiliation_en ? String(row.affiliation_en) : undefined,
    expertiseBg: (row.expertise_bg as string[]) ?? [],
    expertiseEn: (row.expertise_en as string[]) ?? [],
    bioBg: (row.bio_bg as string[]) ?? [],
    bioEn: (row.bio_en as string[]) ?? [],
    photoMediaId: row.photo_media_id ? String(row.photo_media_id) : undefined,
    relatedProjectSlugs: (row.related_project_slugs as string[]) ?? [],
    relatedInsightSlugs: (row.related_insight_slugs as string[]) ?? [],
    seo: (row.seo as PersonRecord["seo"]) ?? {},
    publicationState: (row.publication_state as PersonRecord["publicationState"]) ?? "draft",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function mapPartner(row: Record<string, unknown>): PartnerRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    nameBg: String(row.name_bg ?? ""),
    nameEn: String(row.name_en ?? ""),
    relationship: (row.relationship as PartnerRecord["relationship"]) ?? "proposed",
    noteBg: row.note_bg ? String(row.note_bg) : undefined,
    noteEn: row.note_en ? String(row.note_en) : undefined,
    publicationState: (row.publication_state as PartnerRecord["publicationState"]) ?? "draft",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function mapMedia(row: Record<string, unknown>): MediaRecord {
  return {
    id: String(row.id),
    storagePath: row.storage_path ? String(row.storage_path) : undefined,
    publicUrl: String(row.public_url ?? ""),
    title: row.title ? String(row.title) : undefined,
    altBg: String(row.alt_bg ?? ""),
    altEn: String(row.alt_en ?? ""),
    captionBg: row.caption_bg ? String(row.caption_bg) : undefined,
    captionEn: row.caption_en ? String(row.caption_en) : undefined,
    source: row.source ? String(row.source) : undefined,
    sourceUrl: row.source_url ? String(row.source_url) : undefined,
    usageNote: row.usage_note ? String(row.usage_note) : undefined,
    copyrightNote: row.copyright_note ? String(row.copyright_note) : undefined,
    temporary: Boolean(row.temporary),
    replacementRequired: Boolean(row.replacement_required),
    mimeType: row.mime_type ? String(row.mime_type) : undefined,
    byteSize: row.byte_size ? Number(row.byte_size) : undefined,
    width: row.width ? Number(row.width) : undefined,
    height: row.height ? Number(row.height) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function mapSettings(row: Record<string, unknown>): SiteSettingsRecord {
  return {
    id: "global",
    data: (row.data as SiteSettingsRecord["data"]) ?? fallbackSettings().data,
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) : undefined,
  };
}

function mapStaff(row: Record<string, unknown>): StaffRecord {
  return {
    userId: String(row.user_id),
    email: String(row.email),
    role: (row.role as StaffRecord["role"]) ?? "editor",
    displayName: row.display_name ? String(row.display_name) : undefined,
  };
}

export async function saveSupabaseProject(record: ProjectRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").upsert(projectRow(record));
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveSupabaseInsight(record: InsightRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("insights").upsert({
    id: record.id,
    slug: record.slug,
    type: record.type,
    title_bg: record.titleBg,
    title_en: record.titleEn,
    summary_bg: record.summaryBg,
    summary_en: record.summaryEn,
    body_bg: record.bodyBg,
    body_en: record.bodyEn,
    topics_bg: record.topicsBg,
    topics_en: record.topicsEn,
    related_project_slugs: record.relatedProjectSlugs,
    source_bg: record.sourceBg ?? null,
    source_en: record.sourceEn ?? null,
    published_on: record.date ?? null,
    author: record.author ?? null,
    hero_media_id: record.heroMediaId ?? null,
    seo: record.seo,
    publication_state: record.publicationState,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    published_at: record.publishedAt ?? null,
    created_by: uuidOrNull(record.createdBy),
    updated_by: uuidOrNull(record.updatedBy),
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveSupabasePerson(record: PersonRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("people").upsert({
    id: record.id,
    slug: record.slug,
    kind: record.kind,
    name_bg: record.nameBg,
    name_en: record.nameEn,
    role_bg: record.roleBg ?? null,
    role_en: record.roleEn ?? null,
    affiliation_bg: record.affiliationBg ?? null,
    affiliation_en: record.affiliationEn ?? null,
    expertise_bg: record.expertiseBg,
    expertise_en: record.expertiseEn,
    bio_bg: record.bioBg,
    bio_en: record.bioEn,
    photo_media_id: record.photoMediaId ?? null,
    related_project_slugs: record.relatedProjectSlugs,
    related_insight_slugs: record.relatedInsightSlugs,
    seo: record.seo,
    publication_state: record.publicationState,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    published_at: record.publishedAt ?? null,
    created_by: uuidOrNull(record.createdBy),
    updated_by: uuidOrNull(record.updatedBy),
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveSupabasePartner(record: PartnerRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("partners").upsert({
    id: record.id,
    slug: record.slug,
    name_bg: record.nameBg,
    name_en: record.nameEn,
    relationship: record.relationship,
    note_bg: record.noteBg ?? null,
    note_en: record.noteEn ?? null,
    publication_state: record.publicationState,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    published_at: record.publishedAt ?? null,
    created_by: uuidOrNull(record.createdBy),
    updated_by: uuidOrNull(record.updatedBy),
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveSupabaseSettings(record: SiteSettingsRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "global",
    data: record.data,
    updated_at: record.updatedAt,
    updated_by: uuidOrNull(record.updatedBy),
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveSupabaseMedia(record: MediaRecord) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media").upsert({
    id: record.id,
    storage_path: record.storagePath ?? null,
    public_url: record.publicUrl,
    title: record.title ?? null,
    alt_bg: record.altBg,
    alt_en: record.altEn,
    caption_bg: record.captionBg ?? null,
    caption_en: record.captionEn ?? null,
    source: record.source ?? null,
    source_url: record.sourceUrl ?? null,
    usage_note: record.usageNote ?? null,
    copyright_note: record.copyrightNote ?? null,
    temporary: record.temporary,
    replacement_required: record.replacementRequired,
    mime_type: record.mimeType ?? null,
    byte_size: record.byteSize ?? null,
    width: record.width ?? null,
    height: record.height ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    created_by: uuidOrNull(record.createdBy),
    updated_by: uuidOrNull(record.updatedBy),
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function deleteSupabaseMedia(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("media").select("storage_path").eq("id", id).maybeSingle();
  if (data?.storage_path) {
    await supabase.storage.from("media").remove([String(data.storage_path)]);
  }
  const { error } = await supabase.from("media").delete().eq("id", id);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
