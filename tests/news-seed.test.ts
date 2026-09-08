import { describe, expect, it } from "vitest";
import { insights, getInsight } from "../src/content/insights";
import { parseYouTubeBlock } from "../src/lib/youtube";

const SLUG = "kogato-praktikata-vleze-v-universiteta";
const VIDEO = "https://www.youtube.com/watch?v=kfV3dGGHO5s";

describe("UASG construction-game news seed", () => {
  it("is a published news item, not a concept note or a CIT project", () => {
    const article = getInsight(SLUG);
    expect(article).toBeDefined();
    expect(article?.type).toBe("news");
    expect(article?.relatedProjects ?? []).toEqual([]);
    expect(insights.filter((i) => i.type === "news").map((i) => i.slug)).toEqual([SLUG]);
  });

  it("places the YouTube URL in the middle of both locales without wrapping it in a sentence", () => {
    const article = getInsight(SLUG);
    expect(article).toBeDefined();
    for (const locale of ["bg", "en"] as const) {
      const body = article!.body[locale];
      const index = body.indexOf(VIDEO);
      expect(index).toBeGreaterThan(0);
      expect(index).toBeLessThan(body.length - 1);
      expect(parseYouTubeBlock(body[index]!)).toEqual({ id: "kfV3dGGHO5s" });
      expect(body[index - 1]).toBe("media-bulgarian-construction-game");
    }
  });

  it("cites the UASG news page rather than inventing a CIT source", () => {
    const article = getInsight(SLUG);
    expect(article?.source.bg).toContain("uacg.bg");
    expect(article?.source.en).toContain("uacg.bg");
    expect(article?.source.bg).toContain("2 декември 2025");
    expect(article?.source.en).toContain("2 December 2025");
    expect(article?.date).toBe("2025-12-02");
    expect(article?.author).toBeUndefined();
    expect(article?.heroMediaId).toBe("media-bulgarian-construction-game-editorial");
  });

  it("keeps news out of the Insights sitemap fallback set", () => {
    const notes = insights.filter((item) => item.type !== "news");
    const news = insights.filter((item) => item.type === "news");
    expect(notes.map((item) => item.slug)).not.toContain(SLUG);
    expect(news.map((item) => item.slug)).toEqual([SLUG]);
  });
});
