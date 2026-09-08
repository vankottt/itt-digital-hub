import { describe, expect, it } from "vitest";
import { carouselNavVisible, resolveNewsMedia } from "../src/lib/news-presentation";
import type { Insight } from "../src/content/types";
import type { MediaRecord } from "../src/lib/cms/types";

describe("news carousel presentation", () => {
  it("hides controls when a single item cannot be browsed", () => {
    expect(carouselNavVisible(0)).toBe(false);
    expect(carouselNavVisible(1)).toBe(false);
    expect(carouselNavVisible(2)).toBe(true);
  });

  it("resolves library media when a heroMediaId is present", () => {
    const insight: Insight = {
      slug: "sample",
      type: "news",
      title: { bg: "Заглавие", en: "Title" },
      summary: { bg: "резюме", en: "summary" },
      body: { bg: [], en: [] },
      topics: { bg: [], en: [] },
      source: { bg: "", en: "" },
      heroMediaId: "media-sample",
    };
    const media: MediaRecord[] = [
      {
        id: "media-sample",
        publicUrl: "/images/team/ivan-todorov-portrait-v2.png",
        title: "Sample",
        altBg: "Портрет",
        altEn: "Portrait",
        temporary: false,
        replacementRequired: false,
        createdAt: "",
        updatedAt: "",
      },
    ];
    const resolved = resolveNewsMedia(insight, media, "en");
    expect(resolved?.src).toBe("/images/team/ivan-todorov-portrait-v2.png");
    expect(resolved?.alt).toBe("Portrait");
  });
});
