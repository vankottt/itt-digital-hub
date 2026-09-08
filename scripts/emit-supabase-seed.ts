import { writeFile } from "node:fs/promises";
import path from "node:path";
import { seedStore } from "../src/lib/cms/serialize";

function lit(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return `ARRAY[${value.map((item) => lit(item)).join(", ")}]::text[]`;
  }
  if (typeof value === "object") {
    return `${lit(JSON.stringify(value))}::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const data = seedStore();
  const statements: string[] = ["begin;"];

  for (const m of data.media) {
    statements.push(`insert into public.media (
      id, storage_path, public_url, title, alt_bg, alt_en, caption_bg, caption_en,
      source, source_url, usage_note, copyright_note, temporary, replacement_required,
      mime_type, byte_size, width, height, created_at, updated_at
    ) values (
      ${lit(m.id)}, ${lit(m.storagePath ?? null)}, ${lit(m.publicUrl)}, ${lit(m.title ?? null)},
      ${lit(m.altBg)}, ${lit(m.altEn)}, ${lit(m.captionBg ?? null)}, ${lit(m.captionEn ?? null)},
      ${lit(m.source ?? null)}, ${lit(m.sourceUrl ?? null)}, ${lit(m.usageNote ?? null)}, ${lit(m.copyrightNote ?? null)},
      ${lit(m.temporary)}, ${lit(m.replacementRequired)}, ${lit(m.mimeType ?? null)}, ${lit(m.byteSize ?? null)},
      ${lit(m.width ?? null)}, ${lit(m.height ?? null)}, ${lit(m.createdAt)}, ${lit(m.updatedAt)}
    ) on conflict (id) do update set
      public_url = excluded.public_url, title = excluded.title, alt_bg = excluded.alt_bg, alt_en = excluded.alt_en,
      caption_bg = excluded.caption_bg, caption_en = excluded.caption_en, source = excluded.source,
      source_url = excluded.source_url, usage_note = excluded.usage_note, temporary = excluded.temporary,
      replacement_required = excluded.replacement_required, width = excluded.width, height = excluded.height,
      updated_at = excluded.updated_at;`);
  }

  for (const p of data.projects) {
    statements.push(`insert into public.projects (
      id, slug, title_bg, title_en, summary_bg, summary_en, standfirst_bg, standfirst_en,
      status, lifecycle, type_bg, type_en, domain_bg, domain_en, methodology_name, hero_media_id,
      payload, seo, publication_state, featured, related_project_slugs, related_insight_slugs,
      created_at, updated_at, published_at
    ) values (
      ${lit(p.id)}, ${lit(p.slug)}, ${lit(p.titleBg)}, ${lit(p.titleEn)}, ${lit(p.summaryBg)}, ${lit(p.summaryEn)},
      ${lit(p.standfirstBg)}, ${lit(p.standfirstEn)}, ${lit(p.status)}, ${lit(p.lifecycle)}, ${lit(p.typeBg)}, ${lit(p.typeEn)},
      ${lit(p.domainBg)}, ${lit(p.domainEn)}, ${lit(p.methodologyName)}, ${lit(p.heroMediaId ?? null)},
      ${lit(p.payload)}, ${lit(p.seo)}, ${lit(p.publicationState)}, ${lit(p.featured)},
      ${lit(p.relatedProjectSlugs)}, ${lit(p.relatedInsightSlugs)}, ${lit(p.createdAt)}, ${lit(p.updatedAt)}, ${lit(p.publishedAt ?? null)}
    ) on conflict (slug) do update set
      title_bg = excluded.title_bg, title_en = excluded.title_en, summary_bg = excluded.summary_bg,
      summary_en = excluded.summary_en, standfirst_bg = excluded.standfirst_bg, standfirst_en = excluded.standfirst_en,
      status = excluded.status, lifecycle = excluded.lifecycle, payload = excluded.payload, seo = excluded.seo,
      publication_state = excluded.publication_state, featured = excluded.featured, updated_at = excluded.updated_at,
      published_at = excluded.published_at;`);
  }

  for (const i of data.insights) {
    statements.push(`insert into public.insights (
      id, slug, type, title_bg, title_en, summary_bg, summary_en, body_bg, body_en, topics_bg, topics_en,
      related_project_slugs, source_bg, source_en, published_on, author, hero_media_id, seo, publication_state,
      created_at, updated_at, published_at
    ) values (
      ${lit(i.id)}, ${lit(i.slug)}, ${lit(i.type)}, ${lit(i.titleBg)}, ${lit(i.titleEn)}, ${lit(i.summaryBg)}, ${lit(i.summaryEn)},
      ${lit(i.bodyBg)}, ${lit(i.bodyEn)}, ${lit(i.topicsBg)}, ${lit(i.topicsEn)}, ${lit(i.relatedProjectSlugs)},
      ${lit(i.sourceBg ?? null)}, ${lit(i.sourceEn ?? null)}, ${lit(i.date ?? null)}, ${lit(i.author ?? null)},
      ${lit(i.heroMediaId ?? null)}, ${lit(i.seo)}, ${lit(i.publicationState)}, ${lit(i.createdAt)}, ${lit(i.updatedAt)}, ${lit(i.publishedAt ?? null)}
    ) on conflict (slug) do update set
      type = excluded.type, title_bg = excluded.title_bg, title_en = excluded.title_en, summary_bg = excluded.summary_bg,
      summary_en = excluded.summary_en, body_bg = excluded.body_bg, body_en = excluded.body_en,
      topics_bg = excluded.topics_bg, topics_en = excluded.topics_en, related_project_slugs = excluded.related_project_slugs,
      source_bg = excluded.source_bg, source_en = excluded.source_en, published_on = excluded.published_on,
      author = excluded.author, hero_media_id = excluded.hero_media_id, seo = excluded.seo,
      publication_state = excluded.publication_state, updated_at = excluded.updated_at, published_at = excluded.published_at;`);
  }

  for (const p of data.partners) {
    statements.push(`insert into public.partners (
      id, slug, name_bg, name_en, relationship, note_bg, note_en, publication_state, created_at, updated_at, published_at
    ) values (
      ${lit(p.id)}, ${lit(p.slug)}, ${lit(p.nameBg)}, ${lit(p.nameEn)}, ${lit(p.relationship)},
      ${lit(p.noteBg ?? null)}, ${lit(p.noteEn ?? null)}, ${lit(p.publicationState)}, ${lit(p.createdAt)}, ${lit(p.updatedAt)}, ${lit(p.publishedAt ?? null)}
    ) on conflict (slug) do update set
      name_bg = excluded.name_bg, name_en = excluded.name_en, relationship = excluded.relationship,
      note_bg = excluded.note_bg, note_en = excluded.note_en, publication_state = excluded.publication_state,
      updated_at = excluded.updated_at, published_at = excluded.published_at;`);
  }

  statements.push(`insert into public.site_settings (id, data, updated_at) values (
    'global', ${lit(data.settings.data)}, ${lit(data.settings.updatedAt)}
  ) on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at;`);

  statements.push("commit;");
  const out = path.join(process.cwd(), ".data", "supabase-seed.sql");
  await writeFile(out, statements.join("\n"), "utf8");
  console.log(`Wrote ${statements.length} statements → ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
