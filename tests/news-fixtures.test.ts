import { describe, expect, it } from "vitest";
import { insights, getInsight } from "../src/content/insights";
import {
  DEV_NEWS_FIXTURE_SLUGS,
  DEV_NEWS_FIXTURE_SOURCE,
  devNewsFixtures,
} from "../src/content/dev-news-fixtures";
import { isDevFixturesEnabled } from "../src/content/dev-fixtures";
import { devNewsFixturePhotos } from "../src/content/media";
import {
  applyDevNewsFixtures,
  devNewsFixtureInsightRecords,
} from "../src/lib/cms/dev-news-overlay";
import { applyMissingSeedContent } from "../src/lib/cms/seed-overlay";
import { recordToInsight, seedMedia, seedStore } from "../src/lib/cms/serialize";
import { resolveNewsMedia } from "../src/lib/news-presentation";
import { sortNewsNewestFirst } from "../src/lib/news-order";
import { parseYouTubeBlock } from "../src/lib/youtube";

const UASG_SLUG = "kogato-praktikata-vleze-v-universiteta";

function emptyBundle() {
  return { insights: [] as ReturnType<typeof seedStore>["insights"], media: [] as ReturnType<typeof seedStore>["media"] };
}

describe("demo news fixtures", () => {
  it("keeps confirmed seed news limited to the UASG article", () => {
    expect(insights.filter((item) => item.type === "news").map((item) => item.slug)).toEqual([UASG_SLUG]);
    expect(getInsight(UASG_SLUG)?.source.en).toContain("uacg.bg");
    for (const slug of DEV_NEWS_FIXTURE_SLUGS) {
      expect(insights.some((item) => item.slug === slug)).toBe(false);
      expect(getInsight(slug)).toBeUndefined();
    }
  });

  it("does not put fixture records into the CMS seed import", () => {
    const seeded = seedStore();
    for (const slug of DEV_NEWS_FIXTURE_SLUGS) {
      expect(seeded.insights.some((item) => item.slug === slug)).toBe(false);
    }
    expect(seeded.insights.some((item) => item.id.startsWith("insight-dev-fixture-"))).toBe(false);
    expect(seeded.media.some((item) => item.id.startsWith("media-dev-fixture-"))).toBe(false);
    expect(seedMedia().map((item) => item.id)).toEqual([
      "media-campus-facade",
      "media-campus-hall",
      "media-bulgarian-construction-game",
      "media-bulgarian-construction-game-editorial",
      "media-social-systems-as-algorithms",
      "media-asaesis-from-framework-to-method",
      "media-testing-instead-of-assuming",
      "media-testing-instead-of-assuming-model",
    ]);
  });

  it("marks every demo article internally and never invents authors or source URLs", () => {
    expect(devNewsFixtures).toHaveLength(3);
    expect(devNewsFixtures.map((item) => item.slug)).toEqual([...DEV_NEWS_FIXTURE_SLUGS]);
    for (const article of devNewsFixtures) {
      expect(article.devFixture).toBe(true);
      expect(article.type).toBe("news");
      expect(article.author).toBeUndefined();
      expect(article.relatedProjects ?? []).toEqual([]);
      expect(article.source.bg).toBe(DEV_NEWS_FIXTURE_SOURCE.bg);
      expect(article.source.en).toBe(DEV_NEWS_FIXTURE_SOURCE.en);
      expect(article.source.bg).not.toMatch(/https?:\/\//i);
      expect(article.source.en).not.toMatch(/https?:\/\//i);
      expect(article.heroMediaId).toMatch(/^media-dev-fixture-/);
    }
    expect(devNewsFixtures[0]?.date).toBe("2026-03-12");
    expect(devNewsFixtures[1]?.date).toBe("2026-02-28");
    expect(devNewsFixtures[2]?.date).toBe("2026-02-15");
    expect(devNewsFixtures[0]?.title).toEqual({
      bg: "Данни за по-устойчиво Черноморие",
      en: "Data for a More Resilient Black Sea",
    });
    expect(devNewsFixtures[1]?.title).toEqual({
      bg: "От аудиторията към реалните системи",
      en: "From the Classroom to Real-World Systems",
    });
    expect(devNewsFixtures[2]?.title).toEqual({
      bg: "Вино, туризъм и регионална стойност",
      en: "Wine, Tourism and Regional Value",
    });
  });

  it("places the wine YouTube URL in the middle of both locales without wrapping it in a sentence", () => {
    const article = devNewsFixtures.find((item) => item.slug === "wine-tourism-and-regional-value");
    const video = "https://www.youtube.com/watch?v=kuGllDpI0Y0";
    expect(article).toBeDefined();
    for (const locale of ["bg", "en"] as const) {
      const body = article!.body[locale];
      const index = body.indexOf(video);
      expect(index).toBeGreaterThan(0);
      expect(index).toBeLessThan(body.length - 1);
      expect(parseYouTubeBlock(body[index]!)).toEqual({ id: "kuGllDpI0Y0" });
    }
  });

  it("overlays demo news on the public site by default, including production", () => {
    expect(applyDevNewsFixtures(emptyBundle()).insights.map((item) => item.slug)).toEqual([...DEV_NEWS_FIXTURE_SLUGS]);
    expect(isDevFixturesEnabled({ CIT_DEV_FIXTURES: "1", NODE_ENV: "production" })).toBe(false);
    expect(applyDevNewsFixtures(emptyBundle(), false)).toEqual(emptyBundle());
  });

  it("overlays demo news and media in memory without replacing the UASG article", () => {
    const seeded = seedStore();
    const overlaid = applyDevNewsFixtures(seeded);
    const news = sortNewsNewestFirst(
      overlaid.insights.filter((item) => item.type === "news").map(recordToInsight),
    );
    expect(news.map((item) => item.slug)).toEqual([
      "data-for-a-more-resilient-black-sea",
      "from-classroom-to-real-world-systems",
      "wine-tourism-and-regional-value",
      UASG_SLUG,
    ]);
    const uasg = overlaid.insights.find((item) => item.slug === UASG_SLUG);
    const original = seeded.insights.find((item) => item.slug === UASG_SLUG);
    expect(uasg).toEqual(original);
    expect(uasg?.heroMediaId).toBe("media-bulgarian-construction-game-editorial");

    const blackSea = news.find((item) => item.slug === "data-for-a-more-resilient-black-sea");
    const resolved = resolveNewsMedia(blackSea!, overlaid.media, "en");
    expect(resolved?.src).toBe(devNewsFixturePhotos.coastalWaterSampling.src);
    expect(resolved?.alt).toContain("Generated fixture");
    expect(resolveNewsMedia(recordToInsight(uasg!), overlaid.media, "bg")?.src).toBe(
      "/images/news/bulgarian-construction-game-editorial.jpg",
    );
  });

  it("does not override a real CMS record that already uses a fixture slug", () => {
    const seeded = seedStore();
    const existing = {
      ...devNewsFixtureInsightRecords()[0]!,
      id: "insight-real-collision",
      titleEn: "Existing CMS record",
      createdBy: "editor",
    };
    const overlaid = applyDevNewsFixtures({ ...seeded, insights: [...seeded.insights, existing] }, true);
    const matches = overlaid.insights.filter((item) => item.slug === existing.slug);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.id).toBe("insight-real-collision");
    expect(matches[0]?.titleEn).toBe("Existing CMS record");
  });

  it("preserves CMS edits that keep fixture ids", () => {
    const seeded = seedStore();
    const edited = {
      ...devNewsFixtureInsightRecords()[0]!,
      titleEn: "Edited demonstration title",
      bodyEn: ["Edited body.", "https://www.youtube.com/watch?v=kfV3dGGHO5s"],
      updatedBy: "editor",
    };
    const overlaid = applyDevNewsFixtures({ ...seeded, insights: [...seeded.insights, edited] });
    const matches = overlaid.insights.filter((item) => item.slug === edited.slug);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: edited.id,
      titleEn: "Edited demonstration title",
      bodyEn: edited.bodyEn,
      updatedBy: "editor",
    });
  });

  it("fills confirmed seed news when a CMS store never imported it", () => {
    const seeded = seedStore();
    const uasg = seeded.insights.find((item) => item.slug === UASG_SLUG)!;
    const construction = seeded.media.find((item) => item.id === "media-bulgarian-construction-game")!;
    const hosted = {
      insights: seeded.insights.filter((item) => item.type !== "news"),
      media: seeded.media.filter((item) => item.id === "media-campus-facade" || item.id === "media-campus-hall"),
    };
    const restored = applyDevNewsFixtures(applyMissingSeedContent(hosted));
    expect(restored.insights.some((item) => item.slug === UASG_SLUG)).toBe(true);
    expect(restored.insights.find((item) => item.slug === UASG_SLUG)?.heroMediaId).toBe(uasg.heroMediaId);
    expect(restored.media.some((item) => item.id === construction.id)).toBe(true);
    const news = sortNewsNewestFirst(
      restored.insights.filter((item) => item.type === "news").map(recordToInsight),
    );
    expect(news.map((item) => item.slug)).toEqual([
      "data-for-a-more-resilient-black-sea",
      "from-classroom-to-real-world-systems",
      "wine-tourism-and-regional-value",
      UASG_SLUG,
    ]);
  });

  it("fills an empty seed hero from versioned seed without replacing CMS copy", () => {
    const seeded = seedStore();
    const note = seeded.insights.find((item) => item.slug === "why-social-systems-behave-like-algorithms")!;
    const hosted = {
      insights: [{ ...note, heroMediaId: undefined, titleEn: "CMS title" }],
      media: [] as ReturnType<typeof seedStore>["media"],
    };
    const restored = applyMissingSeedContent(hosted);
    expect(restored.insights[0]?.heroMediaId).toBe(note.heroMediaId);
    expect(restored.insights[0]?.titleEn).toBe("CMS title");
    expect(restored.media.map((item) => item.id)).toEqual(seeded.media.map((item) => item.id));
  });

  it("moves a former seed hero into the body when seed now uses a new card image", () => {
    const seeded = seedStore();
    const uasg = seeded.insights.find((item) => item.slug === UASG_SLUG)!;
    const hosted = {
      insights: [
        {
          ...uasg,
          heroMediaId: "media-bulgarian-construction-game",
          bodyBg: uasg.bodyBg.filter((block) => block !== "media-bulgarian-construction-game"),
          bodyEn: uasg.bodyEn.filter((block) => block !== "media-bulgarian-construction-game"),
          titleEn: "CMS title",
        },
      ],
      media: [] as ReturnType<typeof seedStore>["media"],
    };
    const restored = applyMissingSeedContent(hosted);
    expect(restored.insights[0]?.titleEn).toBe("CMS title");
    expect(restored.insights[0]?.heroMediaId).toBe("media-bulgarian-construction-game-editorial");
    expect(restored.insights[0]?.bodyBg).toContain("media-bulgarian-construction-game");
    expect(restored.insights[0]?.bodyEn).toContain("media-bulgarian-construction-game");
    const videoAt = restored.insights[0]!.bodyBg.indexOf("https://www.youtube.com/watch?v=kfV3dGGHO5s");
    expect(restored.insights[0]?.bodyBg[videoAt - 1]).toBe("media-bulgarian-construction-game");
  });

  it("does not strip saved fixture records when overlay is disabled", () => {
    const seeded = seedStore();
    const saved = applyDevNewsFixtures(seeded, true);
    const leftAlone = applyDevNewsFixtures(saved, false);
    expect(leftAlone.insights.some((item) => item.id.startsWith("insight-dev-fixture-"))).toBe(true);
    expect(leftAlone.media.some((item) => item.id.startsWith("media-dev-fixture-"))).toBe(true);
    expect(leftAlone.insights.map((item) => item.slug)).toEqual(saved.insights.map((item) => item.slug));
  });
});
