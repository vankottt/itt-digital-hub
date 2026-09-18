import type { AiActJourney } from "./types";
import { AI_ACT_JOURNEYS } from "./types";

const MAX = 80;

function clip(value: string | null | undefined): string | undefined {
  const next = value?.trim();
  if (!next) return undefined;
  return next.slice(0, MAX);
}

export function readCampaignParams(search: { get(name: string): string | null }): {
  source?: string;
  campaign?: string;
} {
  return {
    source: clip(search.get("src") ?? search.get("utm_source")),
    campaign: clip(search.get("campaign") ?? search.get("utm_campaign")),
  };
}

export function parseJourney(value: string | null | undefined): AiActJourney | undefined {
  if (!value) return undefined;
  return AI_ACT_JOURNEYS.includes(value as AiActJourney) ? (value as AiActJourney) : undefined;
}
