import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { analysisInsights, ANALYSIS_BODY_VIDEOS, ANALYSIS_INSIGHT_SLUGS } from "../src/content/analysis-insights";
import { insights } from "../src/content/insights";
import {
  analysisInsightPhotos,
  asaesisMethodIllustration,
  socialSystemsIllustration,
  testingInsteadIllustration,
  testingModelIllustration,
} from "../src/content/media";
import { NewsCard } from "../src/components/editorial/NewsCard";
import { applyAnalysisInsights, analysisInsightRecords } from "../src/lib/cms/analysis-overlay";
import { applyDevNewsFixtures } from "../src/lib/cms/dev-news-overlay";
import { recordToInsight, seedMedia, seedStore } from "../src/lib/cms/serialize";
import { mediaPairMatches, resolveMediaById, resolveNewsMedia } from "../src/lib/news-presentation";
import { parseYouTubeBlock } from "../src/lib/youtube";

describe("insights analyses overlay", () => {
  it("keeps confirmed seed concept notes unchanged", () => {
    expect(insights.filter((item) => item.type === "concept-note").map((item) => item.slug)).toEqual([
      "why-social-systems-behave-like-algorithms",
      "asaesis-from-framework-to-method",
      "testing-instead-of-assuming",
    ]);
    const social = insights.find((item) => item.slug === "why-social-systems-behave-like-algorithms");
    expect(social?.heroMediaId).toBe(socialSystemsIllustration.id);
    const resolved = resolveNewsMedia(social!, seedMedia(), "bg");
    expect(resolved?.src).toBe(socialSystemsIllustration.src);
    expect(resolved?.contain).toBeFalsy();
    expect(resolved?.alt).toContain("Генерирана");
    expect(resolved?.caption).toBeUndefined();
    const asaesis = insights.find((item) => item.slug === "asaesis-from-framework-to-method");
    expect(asaesis?.heroMediaId).toBe(asaesisMethodIllustration.id);
    expect(resolveNewsMedia(asaesis!, seedMedia(), "bg")?.src).toBe(asaesisMethodIllustration.src);
    const testing = insights.find((item) => item.slug === "testing-instead-of-assuming");
    expect(testing?.heroMediaId).toBe(testingInsteadIllustration.id);
    const testingHero = resolveNewsMedia(testing!, seedMedia(), "bg");
    expect(testingHero?.src).toBe(testingInsteadIllustration.src);
    expect(testingHero?.contain).toBeFalsy();
    expect(testingHero?.alt).toContain("Генерирана");
    expect(testingHero?.caption).toBeUndefined();
    expect(testing?.body.bg).toContain(testingModelIllustration.id);
    expect(testing?.body.en).toContain(testingModelIllustration.id);
    const model = resolveMediaById(testingModelIllustration.id, seedMedia(), "en");
    expect(model?.src).toBe(testingModelIllustration.src);
    expect(model?.contain).toBeFalsy();
    for (const slug of ANALYSIS_INSIGHT_SLUGS) {
      expect(insights.some((item) => item.slug === slug)).toBe(false);
    }
  });

  it("does not put analyses into the CMS seed import", () => {
    const seeded = seedStore();
    for (const slug of ANALYSIS_INSIGHT_SLUGS) {
      expect(seeded.insights.some((item) => item.slug === slug)).toBe(false);
    }
    expect(seeded.media.some((item) => item.id.startsWith("media-analysis-"))).toBe(false);
  });

  it("overlays three bilingual concept notes with locale-paired diagrams", () => {
    const seeded = seedStore();
    const overlaid = applyAnalysisInsights(applyDevNewsFixtures(seeded));
    const notes = overlaid.insights.filter((item) => item.type === "concept-note").map(recordToInsight);
    expect(notes.map((item) => item.slug).slice(0, 3)).toEqual([...ANALYSIS_INSIGHT_SLUGS]);
    expect(analysisInsights).toHaveLength(3);
    for (const article of analysisInsights) {
      expect(article.type).toBe("concept-note");
      expect(article.author).toBeUndefined();
      expect(article.relatedProjects ?? []).toEqual([]);
      expect(article.heroMediaId).toMatch(/-bg$/);
      expect(article.source.bg).toContain("Не е научна публикация");
      expect(article.source.en).toContain("Not a Center research publication");
    }
    const first = notes[0]!;
    const bg = resolveNewsMedia(first, overlaid.media, "bg");
    const en = resolveNewsMedia(first, overlaid.media, "en");
    expect(bg?.src).toBe(analysisInsightPhotos.feedbackLoopBg.src);
    expect(en?.src).toBe(analysisInsightPhotos.feedbackLoopEn.src);
    expect(bg?.contain).toBe(false);
    const card = renderToStaticMarkup(
      createElement(NewsCard, { insight: first, locale: "bg", channel: "insights", variant: "row", media: bg }),
    );
    expect(card).toContain("object-cover");
    expect(card).not.toContain("object-contain");
    expect(mediaPairMatches(first.heroMediaId, analysisInsightPhotos.feedbackLoopEn.id)).toBe(true);
  });

  it("preserves CMS edits that keep analysis ids", () => {
    const seeded = seedStore();
    const edited = { ...analysisInsightRecords()[0]!, titleEn: "Edited analysis title", updatedBy: "editor" };
    const overlaid = applyAnalysisInsights({ ...seeded, insights: [...seeded.insights, edited] });
    const matches = overlaid.insights.filter((item) => item.slug === edited.slug);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.titleEn).toBe("Edited analysis title");
  });

  it("uses the Analysis drafting fallback instead of News when a card has no media prop", () => {
    const note = insights.find((item) => item.slug === "testing-instead-of-assuming");
    expect(note).toBeDefined();
    const html = renderToStaticMarkup(
      createElement(NewsCard, { insight: note!, locale: "bg", channel: "insights", variant: "row" }),
    );
    expect(html).toContain("Анализ");
    expect(html).toContain("ЦИТ");
    expect(html).toContain("/bg/insights/testing-instead-of-assuming");
    expect(html).toContain("Прочетете");
    expect(html).not.toContain("Новина");
    expect(html).not.toContain(testingInsteadIllustration.src);
  });

  it("covers the testing-instead-of-assuming card photo like News photography", () => {
    const note = insights.find((item) => item.slug === "testing-instead-of-assuming");
    const media = resolveNewsMedia(note!, seedMedia(), "bg");
    const html = renderToStaticMarkup(
      createElement(NewsCard, { insight: note!, locale: "bg", channel: "insights", variant: "row", media }),
    );
    expect(html).toContain("testing-instead-of-assuming.jpg");
    expect(html).toContain("object-cover");
    expect(html).not.toContain("object-contain");
  });

  it("places two whole-line YouTube URLs at about one-third and two-thirds of each analysis body", () => {
    for (const slug of ANALYSIS_INSIGHT_SLUGS) {
      const article = analysisInsights.find((item) => item.slug === slug);
      const [first, second] = ANALYSIS_BODY_VIDEOS[slug];
      expect(article).toBeDefined();
      for (const locale of ["bg", "en"] as const) {
        const body = article!.body[locale];
        const i = body.indexOf(first);
        const j = body.indexOf(second);
        expect(i).toBeGreaterThan(0);
        expect(j).toBeGreaterThan(i);
        expect(j).toBeLessThan(body.length - 1);
        expect(parseYouTubeBlock(body[i]!)).toEqual({ id: new URL(first).searchParams.get("v") });
        expect(parseYouTubeBlock(body[j]!)).toEqual({ id: new URL(second).searchParams.get("v") });
      }
    }
  });
});
