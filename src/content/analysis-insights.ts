import type { Insight } from "./types";

/**
 * ITT does not overlay academic Insights analyses.
 * Helpers remain so the unused CMS overlay stays a no-op.
 */

export const ANALYSIS_INSIGHT_ID_PREFIX = "insight-analysis-";

export const ANALYSIS_INSIGHT_SLUGS = [] as const;

export type AnalysisInsightSlug = string;

export function isAnalysisInsightSlug(slug: string): boolean {
  return (ANALYSIS_INSIGHT_SLUGS as readonly string[]).includes(slug);
}

export function isAnalysisInsightId(id: string): boolean {
  return id.startsWith(ANALYSIS_INSIGHT_ID_PREFIX);
}

export function isAnalysisMediaId(id: string): boolean {
  return id.startsWith("media-analysis-");
}

export const ANALYSIS_BODY_VIDEOS: Record<string, readonly [string, string]> = {};

export const analysisInsights: Insight[] = [];
