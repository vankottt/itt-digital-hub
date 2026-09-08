import {
  DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX,
  devNewsFixtures,
  isDevNewsFixtureSlug,
} from "@/content/dev-news-fixtures";
import { insightToRecord } from "./serialize";
import type { InsightRecord, MediaRecord } from "./types";

const FIXTURE_TIMESTAMP = "2026-09-07T00:00:00.000Z";

export function devNewsFixtureInsightRecords(): InsightRecord[] {
  return devNewsFixtures.map((insight) => {
    const record = insightToRecord(insight);
    return {
      ...record,
      id: `${DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX}${insight.slug}`,
      createdAt: FIXTURE_TIMESTAMP,
      updatedAt: FIXTURE_TIMESTAMP,
      publishedAt: FIXTURE_TIMESTAMP,
      createdBy: "dev-fixture",
      updatedBy: "dev-fixture",
    };
  });
}

export function devNewsFixtureMediaRecords(): MediaRecord[] {
  return [];
}

export function missingDevNewsFixtures(data: { insights: InsightRecord[]; media: MediaRecord[] }): {
  insights: InsightRecord[];
  media: MediaRecord[];
} {
  const insightSlugs = new Set(data.insights.map((item) => item.slug));
  const mediaIds = new Set(data.media.map((item) => item.id));
  return {
    insights: devNewsFixtureInsightRecords().filter((item) => !insightSlugs.has(item.slug)),
    media: devNewsFixtureMediaRecords().filter((item) => !mediaIds.has(item.id)),
  };
}

export function demoNewsMediaNeededFor(record: Pick<InsightRecord, "slug" | "heroMediaId">): MediaRecord[] {
  const all = devNewsFixtureMediaRecords();
  if (isDevNewsFixtureSlug(record.slug)) return all;
  if (record.heroMediaId) {
    return all.filter((item) => item.id === record.heroMediaId);
  }
  return [];
}

export function applyDevNewsFixtures<T extends { insights: InsightRecord[]; media: MediaRecord[] }>(
  data: T,
  enabled = true,
): T {
  if (!enabled) return data;
  const extras = missingDevNewsFixtures(data);
  if (!extras.insights.length && !extras.media.length) return data;
  return {
    ...data,
    insights: [...data.insights, ...extras.insights],
    media: [...data.media, ...extras.media],
  };
}
