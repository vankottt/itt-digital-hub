import type { Insight } from "@/content/types";

/**
 * Homepage News is a curated latest-news preview, not the archive.
 * Desktop (~2.85 cards) and tablet (~2.12 cards) overflow with five items;
 * `/news` continues to list every published article.
 */
export const HOME_NEWS_PREVIEW_LIMIT = 5;

function publicationDateKey(insight: Insight): string {
  return insight.date?.trim() ?? "";
}

/**
 * Newest source publication date first.
 * Equal dates (and missing dates last) are ordered by slug so the result is stable.
 */
export function compareNewsByPublicationDate(a: Insight, b: Insight): number {
  const da = publicationDateKey(a);
  const db = publicationDateKey(b);
  if (da !== db) {
    if (!da) return 1;
    if (!db) return -1;
    return db.localeCompare(da);
  }
  return a.slug.localeCompare(b.slug);
}

export function sortNewsNewestFirst(items: readonly Insight[]): Insight[] {
  return [...items].sort(compareNewsByPublicationDate);
}

export function latestNewsForHomepage(items: readonly Insight[]): Insight[] {
  return sortNewsNewestFirst(items).slice(0, HOME_NEWS_PREVIEW_LIMIT);
}
