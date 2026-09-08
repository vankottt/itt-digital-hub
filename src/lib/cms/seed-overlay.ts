import { parseLibraryMediaBlock } from "@/lib/news-presentation";
import { seedStore } from "./serialize";
import type { InsightRecord, MediaRecord } from "./types";

/**
 * Versioned TypeScript seed is the public baseline. A connected CMS overrides
 * by slug; slugs that were never imported (and empty hero ids on seed slugs)
 * are filled here so production Supabase does not silently drop confirmed seed.
 */
export function missingSeedContent(data: { insights: InsightRecord[]; media: MediaRecord[] }): {
  insights: InsightRecord[];
  media: MediaRecord[];
} {
  const seeded = seedStore();
  const insightSlugs = new Set(data.insights.map((item) => item.slug));
  const mediaIds = new Set(data.media.map((item) => item.id));
  return {
    insights: seeded.insights.filter((item) => !insightSlugs.has(item.slug)),
    media: seeded.media.filter((item) => !mediaIds.has(item.id)),
  };
}

function bodyMediaIds(blocks: string[]): string[] {
  return blocks.flatMap((block) => {
    const id = parseLibraryMediaBlock(block);
    return id ? [id] : [];
  });
}

function insertMissingMediaIds(body: string[], missing: string[]): string[] {
  if (!missing.length) return body;
  const next = [...body];
  for (const id of missing) {
    if (next.includes(id)) continue;
    const youtubeAt = next.findIndex((block) => /youtube\.com|youtu\.be/i.test(block));
    next.splice(youtubeAt >= 0 ? youtubeAt : next.length, 0, id);
  }
  return next;
}

export function applyMissingSeedContent<T extends { insights: InsightRecord[]; media: MediaRecord[] }>(data: T): T {
  const seeded = seedStore();
  const extras = missingSeedContent(data);
  const seedBySlug = new Map(seeded.insights.map((item) => [item.slug, item]));
  const insights = data.insights.map((record) => {
    const seed = seedBySlug.get(record.slug);
    if (!seed) return record;
    let next = record;
    if (seed.heroMediaId && !next.heroMediaId) {
      next = { ...next, heroMediaId: seed.heroMediaId };
    }
    const seedBodyIds = bodyMediaIds(seed.bodyBg);
    const missingBg = seedBodyIds.filter((id) => !next.bodyBg.includes(id));
    const missingEn = bodyMediaIds(seed.bodyEn).filter((id) => !next.bodyEn.includes(id));
    if (missingBg.length || missingEn.length) {
      next = {
        ...next,
        bodyBg: insertMissingMediaIds(next.bodyBg, missingBg),
        bodyEn: insertMissingMediaIds(next.bodyEn, missingEn),
      };
    }
    if (next.heroMediaId && seed.heroMediaId && next.heroMediaId !== seed.heroMediaId && seedBodyIds.includes(next.heroMediaId)) {
      next = { ...next, heroMediaId: seed.heroMediaId };
    }
    return next;
  });
  return {
    ...data,
    insights: extras.insights.length ? [...insights, ...extras.insights] : insights,
    media: extras.media.length ? [...data.media, ...extras.media] : data.media,
  };
}
