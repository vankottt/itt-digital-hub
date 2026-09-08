import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANALYSIS_INSIGHT_SLUGS, analysisInsights } from "../src/content/analysis-insights";
import { insights } from "../src/content/insights";
import { NewsFallbackMedia } from "../src/components/editorial/NewsFallbackMedia";
import { applyAnalysisInsights, analysisInsightRecords } from "../src/lib/cms/analysis-overlay";
import { seedStore } from "../src/lib/cms/serialize";

describe("insights analyses overlay", () => {
  it("does not ship academic Insights analyses", () => {
    expect(ANALYSIS_INSIGHT_SLUGS).toEqual([]);
    expect(analysisInsights).toEqual([]);
    expect(insights).toEqual([]);
    expect(analysisInsightRecords()).toEqual([]);
    expect(applyAnalysisInsights(seedStore()).insights).toEqual([]);
  });

  it("uses ITT on the drafting fallback, not a university mark", () => {
    const html = renderToStaticMarkup(createElement(NewsFallbackMedia, { label: "Анализ" }));
    expect(html).toContain("ITT");
    expect(html).not.toContain("ЦИТ");
    expect(html).not.toContain("CIT");
  });
});
