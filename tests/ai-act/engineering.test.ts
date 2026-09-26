import { describe, expect, it } from "vitest";
import { getAnnex, getArticle, searchKnowledge } from "../../src/ai-act/engine/search";
import { collectExecution, expertStatusLine } from "../../src/ai-act/comparison/presentation";
import { loadExpertInstructions } from "../../src/ai-act/comparison/requests";
import { callTool } from "../../src/ai-act/engine/tools";

const skill = () => loadExpertInstructions(process.cwd(), "2026-09-26");

describe("engineering context", () => {
  it("treats design assistance as context, not an automatic high-risk class", () => {
    const found = searchKnowledge({ query: "Използвам изкуствен интелект при оразмеряване и подготовка на техническа документация." });
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    const text = found.results.map((hit) => hit.excerpt).join("\n");
    expect(text).not.toMatch(/всяко проектиране е високорисков/i);
    expect(skill()).toContain("Do not overclassify");
    expect(skill()).toContain("КИИП is not a legal criterion");
  });

  it("separates project-signing responsibility from the regulation", () => {
    expect(skill()).toContain("does not by itself decide who signs");
    const note = searchKnowledge({ query: "отговорност за крайния проект проектант" });
    expect(note.ok).toBe(true);
    if (!note.ok) return;
    expect(note.results.some((hit) => hit.kind === "engineering" || hit.kind === "interpretation")).toBe(true);
  });

  it("retrieves Annex III water-supply wording without treating every water system as high-risk", () => {
    const found = searchKnowledge({
      query: "Система с изкуствен интелект автоматично управлява помпи и налягане във водоснабдителна мрежа.",
    });
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    expect(found.results.some((hit) => hit.annex === "III" && hit.kind === "law")).toBe(true);
    const annex = getAnnex("III");
    expect(annex.ok && annex.data.found).toBe(true);
    const text = JSON.stringify(annex.ok ? annex.data : {});
    expect(text).toContain("водоснабдяването");
    expect(text).toContain("защитни елементи");
    expect(skill()).toContain("water utility");
  });

  it("rejects a blanket high-risk rule for investment design", () => {
    const found = searchKnowledge({
      query: "Вярно ли е, че всеки изкуствен интелект, използван при инвестиционно проектиране, е система с висок риск?",
    });
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    expect(found.results.some((hit) => hit.article === "6" || hit.annex === "III")).toBe(true);
    expect(skill()).toContain("investment project");
  });

  it("keeps engineering context out of the statutory source class", () => {
    const fetched = callTool("get_ai_act_reference", {
      referenceId: searchId("помпи оператор препоръчва"),
    });
    expect(fetched.ok).toBe(true);
    if (!fetched.ok) return;
    const execution = collectExecution([{ name: "get_ai_act_reference", output: JSON.stringify(fetched.data) }]);
    expect(execution.sources).toHaveLength(1);
    expect(["engineering", "interpretation", "law"]).toContain(execution.sources[0]?.kind);
    if (execution.sources[0]?.kind === "engineering") {
      expect(expertStatusLine("bg", 1, false)).toBe("1 използван източник");
      expect(execution.sources[0]?.authority).toBe("ITT Digital Hub");
    }
  });
});

function searchId(query: string): string {
  const found = searchKnowledge({ query });
  if (!found.ok || found.results.length === 0) return "aia_missing_p1";
  const preferred = found.results.find((hit) => hit.kind === "engineering") ?? found.results[0];
  return preferred?.referenceId ?? "aia_missing_p1";
}

describe("broader regulation coverage", () => {
  it("fetches importer and authorised representative definitions", () => {
    const article = getArticle("3");
    expect(article.ok && article.data.found).toBe(true);
    const text = JSON.stringify(article.ok ? article.data : {});
    expect(text).toContain("„дистрибутор“");
  });

  it("does not invent Article 999 or a universal registration duty", () => {
    const missing = getArticle("999");
    expect(missing.ok && missing.data.found).toBe(false);
    const found = searchKnowledge({ query: "Does every AI system used by an engineering company have to be registered as high-risk?" });
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    expect(found.results.map((hit) => hit.excerpt).join("\n")).not.toMatch(/every ai system must be registered/i);
  });
});
