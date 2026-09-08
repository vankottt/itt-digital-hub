import { describe, expect, it } from "vitest";
import { insights } from "../src/content/insights";
import { carouselNavVisible, resolveNewsMedia } from "../src/lib/news-presentation";
import { seedMedia } from "../src/lib/cms/serialize";

describe("news carousel presentation", () => {
  it("hides controls when a single item cannot be browsed", () => {
    expect(carouselNavVisible(0)).toBe(false);
    expect(carouselNavVisible(1)).toBe(false);
    expect(carouselNavVisible(2)).toBe(true);
  });

  it("attaches the generated editorial photograph to the confirmed UASG article card", () => {
    const article = insights.find((i) => i.slug === "kogato-praktikata-vleze-v-universiteta");
    expect(article).toBeDefined();
    expect(article?.heroMediaId).toBe("media-bulgarian-construction-game-editorial");
    const resolved = resolveNewsMedia(article!, seedMedia(), "bg");
    expect(resolved?.src).toBe("/images/news/bulgarian-construction-game-editorial.jpg");
    expect(resolved?.contain).toBeFalsy();
    expect(resolved?.alt).toContain("Генерирана илюстрация");
  });

  it("resolves library media when a heroMediaId is present", () => {
    const article = insights.find((i) => i.type === "news");
    expect(article).toBeDefined();
    const withMedia = { ...article!, heroMediaId: "media-campus-facade" };
    const resolved = resolveNewsMedia(withMedia, seedMedia(), "en");
    expect(resolved?.src).toBe("/images/temporary-uacg/campus-facade.jpg");
    expect(resolved?.alt).toContain("University of Architecture");
  });
});
