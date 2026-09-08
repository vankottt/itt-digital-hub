import { DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX } from "./media";
import type { Insight } from "./types";

/**
 * ITT does not overlay demonstration News articles.
 * Helpers remain so the unused CMS overlay stays a no-op.
 */

export const DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX = "insight-dev-fixture-";

export const DEV_NEWS_FIXTURE_SOURCE = {
  bg: "Демонстрационна фикстура. Не е публична новина на ITT.",
  en: "Demonstration fixture. Not a public ITT news item.",
} as const;

export const DEV_NEWS_FIXTURE_SLUGS = [] as const;

export type DevNewsFixtureSlug = string;

export function isDevNewsFixtureSlug(slug: string): boolean {
  return (DEV_NEWS_FIXTURE_SLUGS as readonly string[]).includes(slug);
}

export function isDevNewsFixtureInsightId(id: string): boolean {
  return id.startsWith(DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX);
}

export function isDevNewsFixtureMediaId(id: string): boolean {
  return id.startsWith(DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX);
}

export const devNewsFixtures: Insight[] = [];
