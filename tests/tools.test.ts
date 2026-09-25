import { describe, expect, it } from "vitest";
import { toolsFor } from "../src/content/tools";
import { toolsPage } from "../src/content/pages";
import { primaryNav } from "../src/content/site";

describe("tools catalogue", () => {
  it("places Tools immediately before About in primary nav", () => {
    const keys = primaryNav.map((item) => item.key);
    expect(keys.indexOf("tools")).toBe(keys.indexOf("people") - 1);
  });

  it("lists the AI Act assistant first as an openable product", () => {
    const [first, second, third] = toolsFor("bg");
    expect(first?.id).toBe("ai-act-assistant");
    expect(first?.href).toBe("/bg/ai-act-agent");
    expect(first?.status).toBeUndefined();
    expect(second?.id).toBe("settlement-analyzer");
    expect(second?.href).toBe("/bg/settlement-analyzer");
    expect(second?.status).toBeUndefined();
    expect(third?.id).toBe("pipe-thermal-analysis");
    expect(third?.href).toBe("/bg/pipe-thermal-analysis");
    expect(third?.status).toBeUndefined();
    expect(toolsFor("en")[0]?.href).toBe("/en/ai-act-agent");
    expect(toolsFor("en")[0]?.image).toContain("ai-act-assistant-card-en");
    expect(toolsFor("bg")[0]?.image).toContain("ai-act-assistant-card-bg");
    expect(toolsFor("en")[1]?.image).toContain("settlement-analyzer-card-en");
    expect(toolsFor("bg")[1]?.image).toContain("settlement-analyzer-card-bg");
    expect(toolsFor("en")[1]?.href).toBe("/en/settlement-analyzer");
    expect(toolsFor("en")[1]?.status).toBeUndefined();
    expect(toolsFor("en")[2]?.href).toBe("/en/pipe-thermal-analysis");
    expect(toolsFor("en")[2]?.image).toContain("pipe-thermal-analysis-card-en");
    expect(toolsFor("bg")[2]?.image).toContain("pipe-thermal-analysis-card-bg");
    expect(toolsFor("bg")[3]?.id).toBe("vik-designer");
    expect(toolsFor("bg")[3]?.href).toBe("/bg/vik-designer");
    expect(toolsFor("en")[3]?.href).toBe("/en/vik-designer");
    expect(toolsFor("bg")[3]?.image).toBe("/tools/vik-designer-card.svg");
  });

  it("does not point the analyzer card at an external site", () => {
    for (const locale of ["bg", "en"] as const) {
      const analyzer = toolsFor(locale)[1];
      expect(analyzer?.href).toBe(`/${locale}/settlement-analyzer`);
      expect(analyzer?.external).toBeUndefined();
      expect(JSON.stringify(analyzer)).not.toMatch(/analizator-naseleni-mesta/i);
    }
  });

  it("uses the specified document titles", () => {
    expect(toolsPage.meta.title.bg).toBe("Инструменти · ITT Digital Hub");
    expect(toolsPage.meta.title.en).toBe("Tools · ITT Digital Hub");
  });
});
