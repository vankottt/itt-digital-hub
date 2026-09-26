import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getCorpus } from "../../src/vik-proektant/engine/corpus";
import { getReference, isReferenceId, searchKnowledge } from "../../src/vik-proektant/engine/search";
import { callTool } from "../../src/vik-proektant/engine/tools";
import cases from "../../src/vik-proektant/evals/cases.json";

type EvalCase = (typeof cases)[number];

describe("vik knowledge retrieval", () => {
  const corpus = getCorpus();

  it("indexes the markdown corpus without treating duplicate text as extra sources", () => {
    expect(corpus.documents.length).toBe(18);
    expect(corpus.audit.knowledgeFiles).toBe(18);
    expect(corpus.audit.totalBytes).toBeGreaterThan(7_000_000);
    expect(corpus.audit.chunks).toBeGreaterThan(1000);
    expect(corpus.audit.duplicateChunkCopies).toBe(corpus.chunks.filter((chunk) => chunk.duplicateOf).length);
    expect(corpus.audit.replacementCharacters).toBe(0);
    expect(corpus.audit.missingTitle).toEqual([]);
  });

  it("returns a stable reference for the external water-supply scope", () => {
    const result = searchKnowledge({ query: "Коя наредба урежда проектирането на външни водоснабдителни системи и какъв е нейният обхват?", limit: 3 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.results[0]?.documentId).toBe("rd-02-20-2-2024");
    expect(result.results[0]?.article).toBe("1");
    expect(isReferenceId(result.results[0]?.referenceId ?? "")).toBe(true);
    const reference = getReference(result.results[0]?.referenceId ?? "");
    expect(reference.ok).toBe(true);
    if (!reference.ok) return;
    expect(reference.reference.text.length).toBeGreaterThan(40);
    expect(reference.reference.text.length).toBeLessThanOrEqual(3500);
  });

  it("does not return a fabricated article", () => {
    const result = searchKnowledge({ query: "чл. 9999 Наредба № 4 от 2005", limit: 5 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.results).toEqual([]);
  });

  it("rejects unsafe reference ids and unknown categories", () => {
    expect(getReference("../etc/passwd").ok).toBe(false);
    expect(getReference("vk1_missing_a1_p0").ok).toBe(false);
    expect(searchKnowledge({ query: "водоснабдяване", category: "../secrets" }).ok).toBe(false);
    expect(searchKnowledge({ query: "а".repeat(401) }).ok).toBe(false);
    expect(searchKnowledge({ query: "водоснабдяване", limit: 99 }).ok).toBe(false);
  });

  it("bounds excerpts and refuses unexpected tool fields", () => {
    const result = searchKnowledge({ query: "питейна вода Наредба № 9", limit: 8 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.results.length).toBeLessThanOrEqual(8);
    for (const hit of result.results) expect(hit.excerpt.length).toBeLessThanOrEqual(700);
    expect(callTool("search_vik_knowledge", { query: "питейна вода", path: "../knowledge" }).ok).toBe(false);
  });
});

describe("vik eval cases", () => {
  it("covers the required behavioral categories", () => {
    const counts = new Map<string, number>();
    for (const item of cases) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    expect(counts.get("direct")).toBeGreaterThanOrEqual(10);
    expect(counts.get("indirect")).toBeGreaterThanOrEqual(5);
    expect(counts.get("missing-input")).toBeGreaterThanOrEqual(5);
    expect(counts.get("source-retrieval")).toBeGreaterThanOrEqual(10);
    expect(counts.get("calculation")).toBeGreaterThanOrEqual(5);
    expect(counts.get("negative")).toBeGreaterThanOrEqual(5);
    expect(counts.get("hallucination")).toBeGreaterThanOrEqual(5);
    expect(counts.get("comparison-showcase")).toBeGreaterThanOrEqual(5);
  });

  it("matches retrieval, empty results and calculation checks", () => {
    for (const item of cases as EvalCase[]) {
      const expectCase = item.expect as {
        type: string;
        documentId?: string;
        article?: string;
        tool?: string;
        arguments?: Record<string, unknown>;
        result?: Record<string, number>;
      };
      if (expectCase.type === "retrieval") {
        const result = searchKnowledge({ query: item.prompt, limit: 3 });
        expect(result.ok, item.id).toBe(true);
        if (!result.ok) continue;
        expect(
          result.results.some((hit) => hit.documentId === expectCase.documentId && (expectCase.article ? hit.article === expectCase.article : true)),
          item.id,
        ).toBe(true);
      }
      if (expectCase.type === "empty") {
        const result = searchKnowledge({ query: item.prompt, limit: 3 });
        expect(result.ok && result.results.length === 0, item.id).toBe(true);
      }
      if (expectCase.type === "missing-calculation" || expectCase.type === "invalid-calculation") {
        const result = callTool(expectCase.tool ?? "", expectCase.arguments ?? {});
        expect(result.ok, item.id).toBe(false);
        if (!result.ok) expect(result.code).toBe("invalid_input");
      }
      if (expectCase.type === "calculation") {
        const result = callTool(expectCase.tool ?? "", expectCase.arguments ?? {});
        expect(result.ok, item.id).toBe(true);
        if (!result.ok || !expectCase.result) continue;
        const data = result.data as { result: Record<string, number> };
        for (const [key, value] of Object.entries(expectCase.result)) {
          expect(Math.abs((data.result[key] ?? 0) - value)).toBeLessThan(0.05);
        }
      }
    }
  });
});

describe("vik engine has no model client", () => {
  it("does not call an LLM from retrieval or MCP handling", () => {
    const sources = [
      "src/vik-proektant/engine/corpus.ts",
      "src/vik-proektant/engine/search.ts",
      "src/vik-proektant/engine/calculations.ts",
      "src/vik-proektant/engine/tools.ts",
      "src/vik-proektant/mcp/http.ts",
    ]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(sources).not.toMatch(/api\.openai\.com|openrouter|generativelanguage|gemini/i);
  });
});
