import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createVikDesignerAgent } from "../../platform/agent-hub/agents/vik-designer/handler";
import { systemPrompt } from "../../platform/agent-hub/agents/vik-designer/prompt";
import { retrieveVikContext } from "../../platform/agent-hub/agents/vik-designer/retrieval";
import { createMockProvider } from "../../platform/agent-hub/src/providers/mock";
import { createModelRouter } from "../../platform/agent-hub/src/providers/router";
import { createAgentRegistry } from "../../platform/agent-hub/src/registry";
import { createToolRegistry } from "../../platform/agent-hub/src/tools/registry";
import { VIK_CHAT_PATH, VIK_SESSION_STORAGE_KEY } from "../../src/lib/vik-designer/client";

describe("vik-designer", () => {
  it("resolves beside the AI Act agent", () => {
    const registry = createAgentRegistry();
    expect(registry.get("vik-designer")?.manifest.id).toBe("vik-designer");
    expect(registry.get("vik-designer")?.manifest.enabled).toBe(true);
    expect(registry.get("ai-act")?.manifest.id).toBe("ai-act");
    expect(registry.get("vik-designer")?.act).toBeUndefined();
  });

  it("answers an exact article lookup from РД-02-20-2 without the full corpus", () => {
    const result = retrieveVikContext("чл. 1 от РД-02-20-2");
    expect(result.confident).toBe(true);
    expect(result.chunks[0]?.chunk.documentId).toBe("rd-02-20-2-2024");
    expect(result.chunks[0]?.chunk.article).toBe("1");
    expect(result.selectedChars).toBeLessThan(12_001);
    expect(result.context.length).toBeLessThan(20_000);
    expect(new Set(result.chunks.map((item) => item.chunk.documentId)).size).toBeLessThanOrEqual(3);
  });

  it("prefers the 2004 connections ordinance", () => {
    const result = retrieveVikContext("Какви са изискванията за присъединяване към ВиК");
    expect(result.chunks[0]?.chunk.documentId).toBe("naredba-4-2004-prisaedinyavane");
  });

  it("uses the previous user question when the follow-up only refers back", () => {
    const bare = retrieveVikContext("А какъв е основният ѝ обхват?");
    expect(bare.confident).toBe(false);
    const carried = retrieveVikContext("А какъв е основният ѝ обхват?", "Коя наредба урежда външните водоснабдителни системи?");
    expect(carried.chunks[0]?.chunk.documentId).toBe("rd-02-20-2-2024");
  });

  it("prefers the 2024 external water ordinance", () => {
    const result = retrieveVikContext("Коя наредба урежда външните водоснабдителни системи?");
    expect(result.chunks[0]?.chunk.documentId).toBe("rd-02-20-2-2024");
  });

  it("marks an unextracted equation as unsafe for a numeric answer", () => {
    const result = retrieveVikContext("чл. 107 наредба 4 от 2005 сградни водопроводни");
    expect(result.chunks.some((item) => item.chunk.documentId === "naredba-4-2005-sgradni-vik" && item.chunk.article === "107")).toBe(true);
    expect(result.context).toContain("Не давай нормативна числова стойност от памет");
  });

  it("does not treat a nearby article as proof of a missing value", () => {
    const result = retrieveVikContext(
      "Какъв е размерът на таксата за присъединяване на нов имот към ВиК мрежата на София през 2026 г. и в какъв срок операторът трябва да я фактурира?",
    );
    expect(result.confident).toBe(true);
    expect(result.chunks[0]?.chunk.documentId).toBe("naredba-4-2004-prisaedinyavane");
    const prompt = systemPrompt("bg", result);
    expect(prompt).toContain("Не представяй съседен член като доказателство за липсващата стойност");
    expect(prompt).toContain("Цитирай член само за твърдение, което неговият текст директно подкрепя");
    expect(prompt).not.toContain("чл. 13 включва конкретните цени");
  });

  it("tells the model not to invent a standard value", () => {
    const result = retrieveVikContext("Какво изисква БДС EN 806 за сградни инсталации?");
    const prompt = systemPrompt("bg", result);
    expect(result.standardGuard).toBe(true);
    expect(prompt).toContain("Пълният текст на такъв стандарт не е в базата");
    expect(prompt.length).toBeLessThan(40_000);
  });

  it("does not use the AI Act lead gate", async () => {
    const agent = createVikDesignerAgent();
    const models = createModelRouter({
      mock: createMockProvider(),
      local: createMockProvider(),
      gemini: createMockProvider(),
      openai: createMockProvider(),
      openrouter: createMockProvider(),
    });
    const response = await agent.handle(
      { sessionId: "vik-session-1", locale: "bg", message: "чл. 1 от РД-02-20-2", history: [] },
      { requestId: "req-vik", signal: AbortSignal.timeout(5_000), models, tools: createToolRegistry(), knowledgeDir: null, now: () => new Date() },
    );
    expect(response.answer.startsWith("mock:")).toBe(true);
    expect(response.state).toBeUndefined();
    const source = readFileSync("platform/agent-hub/agents/vik-designer/handler.ts", "utf8");
    expect(source).not.toContain("LEAD_REQUIRED");
    expect(source).not.toContain("gate-token");
  });

  it("keeps the frontend session separate from AI Act", () => {
    expect(VIK_CHAT_PATH).toBe("/v1/agents/vik-designer/chat");
    expect(VIK_SESSION_STORAGE_KEY).toBe("itt-vik-designer-session-v1");
    expect(VIK_SESSION_STORAGE_KEY).not.toBe("itt-ai-act-session-v1");
    const page = readFileSync("src/components/vik-designer/VikDesignerAssistant.tsx", "utf8");
    expect(page).toContain("VIK_CHAT_PATH");
    expect(page).toContain("VIK_SESSION_STORAGE_KEY");
    expect(page).not.toContain("/v1/agents/ai-act/chat");
    expect(page).not.toContain("itt-ai-act-session");
  });
});
