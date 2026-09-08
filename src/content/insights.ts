import type { Insight } from "./types";

/**
 * ITT does not publish News or Insights. Public `/news` and `/insights` redirect home.
 * Keep this seed empty so the CMS fallback cannot resurrect CIT/UASG articles.
 */

export const insights: Insight[] = [];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
