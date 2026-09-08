export type PublicContentSource = "supabase" | "local" | "seed" | "seed-fallback";

export interface ContentSourceSnapshot {
  source: PublicContentSource;
  /** Short operational reason. Never shown on public pages. */
  fallbackReason?: string;
  at: string;
}

let snapshot: ContentSourceSnapshot | null = null;

export function recordContentSource(source: PublicContentSource, fallbackReason?: string, at = new Date().toISOString()): ContentSourceSnapshot {
  snapshot = { source, fallbackReason, at };
  if (source === "seed-fallback") {
    console.warn("[cit-cms] Public content is serving the versioned seed fallback.", {
      reason: fallbackReason ?? "CMS unavailable",
      at,
    });
  }
  return snapshot;
}

export function getContentSourceSnapshot(): ContentSourceSnapshot | null {
  return snapshot;
}

export function resetContentSourceSnapshot(): void {
  snapshot = null;
}
