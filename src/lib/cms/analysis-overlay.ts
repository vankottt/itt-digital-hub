import {
  ANALYSIS_INSIGHT_ID_PREFIX,
  analysisInsights,
  isAnalysisInsightSlug,
} from "@/content/analysis-insights";
import { analysisInsightPhotos } from "@/content/media";
import { insightToRecord } from "./serialize";
import type { InsightRecord, MediaRecord } from "./types";

const TIMESTAMP = "2026-09-07T12:00:00.000Z";

const USAGE =
  "Editorial Insights diagram. May be saved from /admin. Does not depict a measured Center result or a live CIT system.";

export function analysisInsightRecords(): InsightRecord[] {
  return analysisInsights.map((insight) => {
    const record = insightToRecord(insight);
    return {
      ...record,
      id: `${ANALYSIS_INSIGHT_ID_PREFIX}${insight.slug}`,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
      publishedAt: TIMESTAMP,
      createdBy: "dev-fixture",
      updatedBy: "dev-fixture",
    };
  });
}

export function analysisInsightMediaRecords(): MediaRecord[] {
  return Object.values(analysisInsightPhotos).map((photo) => ({
    id: photo.id,
    publicUrl: photo.src,
    title: photo.src.split("/").pop(),
    altBg: photo.alt.bg,
    altEn: photo.alt.en,
    source: "Editorial diagram supplied for Insights analyses.",
    usageNote: USAGE,
    copyrightNote: "Editorial diagram. Not a Center photograph or measured result.",
    temporary: false,
    replacementRequired: false,
    mimeType: photo.mimeType,
    byteSize: photo.byteSize,
    width: photo.width,
    height: photo.height,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    createdBy: "dev-fixture",
    updatedBy: "dev-fixture",
  }));
}

export function missingAnalysisInsights(data: { insights: InsightRecord[]; media: MediaRecord[] }): {
  insights: InsightRecord[];
  media: MediaRecord[];
} {
  const insightSlugs = new Set(data.insights.map((item) => item.slug));
  const mediaIds = new Set(data.media.map((item) => item.id));
  return {
    insights: analysisInsightRecords().filter((item) => !insightSlugs.has(item.slug)),
    media: analysisInsightMediaRecords().filter((item) => !mediaIds.has(item.id)),
  };
}

export function analysisMediaNeededFor(record: Pick<InsightRecord, "slug" | "heroMediaId">): MediaRecord[] {
  const all = analysisInsightMediaRecords();
  if (isAnalysisInsightSlug(record.slug)) return all;
  if (record.heroMediaId) {
    return all.filter((item) => item.id === record.heroMediaId);
  }
  return [];
}

export function applyAnalysisInsights<T extends { insights: InsightRecord[]; media: MediaRecord[] }>(
  data: T,
  enabled = true,
): T {
  if (!enabled) return data;
  const extras = missingAnalysisInsights(data);
  if (!extras.insights.length && !extras.media.length) return data;
  return {
    ...data,
    insights: [...extras.insights, ...data.insights],
    media: [...data.media, ...extras.media],
  };
}
