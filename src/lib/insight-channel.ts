import type { InsightType } from "@/content/types";
import type { RouteKey } from "@/lib/paths";

/** Public channels that share the insight record, but not the same listing. */
export function normalizeInsightType(type: string | undefined): InsightType {
  return type === "news" ? "news" : "concept-note";
}

export function insightRouteKey(type: string | undefined): Extract<RouteKey, "insights" | "news"> {
  return normalizeInsightType(type) === "news" ? "news" : "insights";
}
