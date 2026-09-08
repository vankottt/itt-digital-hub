import { describe, expect, it } from "vitest";
import type { Insight } from "../src/content/types";
import { HOME_NEWS_PREVIEW_LIMIT, latestNewsForHomepage, sortNewsNewestFirst } from "../src/lib/news-order";

function news(slug: string, date?: string): Insight {
  return {
    slug,
    type: "news",
    title: { bg: slug, en: slug },
    summary: { bg: slug, en: slug },
    body: { bg: [slug], en: [slug] },
    topics: { bg: [], en: [] },
    source: { bg: "source", en: "source" },
    date,
  };
}

describe("news ordering", () => {
  it("sorts published news newest source date first", () => {
    const items = [news("older", "2025-01-01"), news("newer", "2025-12-02"), news("mid", "2025-06-15")];
    expect(sortNewsNewestFirst(items).map((item) => item.slug)).toEqual(["newer", "mid", "older"]);
  });

  it("uses slug as a deterministic tie-breaker for equal dates", () => {
    const items = [news("zeta", "2025-12-02"), news("alpha", "2025-12-02"), news("mu", "2025-12-02")];
    expect(sortNewsNewestFirst(items).map((item) => item.slug)).toEqual(["alpha", "mu", "zeta"]);
  });

  it("places records without a publication date after dated records", () => {
    const items = [news("undated"), news("dated", "2025-12-02")];
    expect(sortNewsNewestFirst(items).map((item) => item.slug)).toEqual(["dated", "undated"]);
  });

  it("does not mutate the input list", () => {
    const items = [news("older", "2025-01-01"), news("newer", "2025-12-02")];
    const snapshot = items.map((item) => item.slug);
    sortNewsNewestFirst(items);
    expect(items.map((item) => item.slug)).toEqual(snapshot);
  });

  it("limits the homepage preview while preserving newest-first order", () => {
    const items = Array.from({ length: HOME_NEWS_PREVIEW_LIMIT + 3 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return news(`item-${day}`, `2025-12-${day}`);
    });
    const preview = latestNewsForHomepage(items);
    expect(preview).toHaveLength(HOME_NEWS_PREVIEW_LIMIT);
    expect(preview.map((item) => item.slug)).toEqual(["item-08", "item-07", "item-06", "item-05", "item-04"]);
  });
});
