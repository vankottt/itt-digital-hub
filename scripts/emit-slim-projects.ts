import { writeFile } from "node:fs/promises";
import { seedStore } from "../src/lib/cms/serialize";

function lit(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return `ARRAY[${value.map((item) => lit(item)).join(", ")}]::text[]`;
  }
  if (typeof value === "object") {
    return `${lit(JSON.stringify(value))}::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const statements = seedStore().projects.map(
    (p) => `insert into public.projects (
      id, slug, title_bg, title_en, summary_bg, summary_en, standfirst_bg, standfirst_en,
      status, lifecycle, type_bg, type_en, domain_bg, domain_en, methodology_name, hero_media_id,
      payload, seo, publication_state, featured, related_project_slugs, related_insight_slugs,
      created_at, updated_at, published_at
    ) values (
      ${lit(p.id)}, ${lit(p.slug)}, ${lit(p.titleBg)}, ${lit(p.titleEn)}, ${lit(p.summaryBg)}, ${lit(p.summaryEn)},
      ${lit(p.standfirstBg)}, ${lit(p.standfirstEn)}, ${lit(p.status)}, ${lit(p.lifecycle)}, ${lit(p.typeBg)}, ${lit(p.typeEn)},
      ${lit(p.domainBg)}, ${lit(p.domainEn)}, ${lit(p.methodologyName)}, ${lit(p.heroMediaId ?? null)},
      '{}'::jsonb, ${lit(p.seo)}, ${lit(p.publicationState)}, ${lit(p.featured)},
      ${lit(p.relatedProjectSlugs)}, ${lit(p.relatedInsightSlugs)}, ${lit(p.createdAt)}, ${lit(p.updatedAt)}, ${lit(p.publishedAt ?? null)}
    ) on conflict (slug) do update set
      title_bg = excluded.title_bg, title_en = excluded.title_en, summary_bg = excluded.summary_bg,
      summary_en = excluded.summary_en, standfirst_bg = excluded.standfirst_bg, standfirst_en = excluded.standfirst_en,
      status = excluded.status, lifecycle = excluded.lifecycle, seo = excluded.seo,
      publication_state = excluded.publication_state, featured = excluded.featured, updated_at = excluded.updated_at,
      published_at = excluded.published_at;`,
  );
  await writeFile(".data/chunks/projects-slim.sql", statements.join("\n"), "utf8");
  console.log(statements.join("\n").length);
}

main();
