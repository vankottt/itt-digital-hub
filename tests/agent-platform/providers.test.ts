import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProviderNotEnabledError } from "../../platform/agent-hub/src/providers/errors";
import { createGeminiProvider, createLocalProvider, createOpenaiProvider } from "../../platform/agent-hub/src/providers/disabled";
import { createMockProvider } from "../../platform/agent-hub/src/providers/mock";
import { createOpenRouterProvider } from "../../platform/agent-hub/src/providers/openrouter";
import { createModelRouter } from "../../platform/agent-hub/src/providers/router";
import { toolFromMcp } from "../../platform/agent-hub/src/tools/mcp";
import { createToolRegistry } from "../../platform/agent-hub/src/tools/registry";

const request = {
  provider: "mock" as const,
  messages: [{ role: "user" as const, content: "hello" }],
};

describe("model and tool foundations", () => {
  it("does not fall back from a disabled provider to mock", async () => {
    let mockCalls = 0;
    const mock = createMockProvider();
    const router = createModelRouter({
      mock: {
        id: "mock",
        async complete(input) {
          mockCalls += 1;
          return mock.complete(input);
        },
      },
      local: createLocalProvider(),
      gemini: createGeminiProvider({ GEMINI_API_KEY: "super-secret-gemini-key" }),
      openai: createOpenaiProvider({ OPENAI_API_KEY: "super-secret-openai-key" }),
      openrouter: createOpenRouterProvider({ env: {} }),
    });

    await expect(router.complete({ ...request, provider: "gemini" })).rejects.toBeInstanceOf(ProviderNotEnabledError);
    await expect(router.complete({ ...request, provider: "openai" })).rejects.toBeInstanceOf(ProviderNotEnabledError);
    await expect(router.complete({ ...request, provider: "local" })).rejects.toBeInstanceOf(ProviderNotEnabledError);
    expect(mockCalls).toBe(0);
    expect((await router.complete(request)).text).toBe("mock:hello");

    try {
      await createGeminiProvider({ GEMINI_API_KEY: "super-secret-gemini-key" }).complete({
        ...request,
        provider: "gemini",
      });
    } catch (error) {
      expect(String(error)).not.toContain("super-secret-gemini-key");
      expect(error).toMatchObject({ keyConfigured: true, providerId: "gemini" });
    }
  });

  it("keeps provider modules free of network calls", () => {
    const source = readFileSync("platform/agent-hub/src/providers/disabled.ts", "utf8");
    expect(source).not.toMatch(/fetch\(|generativelanguage|api\.openai\.com/);
  });

  it("adapts an MCP client into the tool registry", async () => {
    const registry = createToolRegistry();
    registry.register(
      toolFromMcp(
        {
          async call(name, input) {
            return { name, input };
          },
        },
        "knowledge.search",
        "Search local knowledge",
      ),
    );
    const tool = registry.get("knowledge.search");
    const result = await tool?.execute({ query: "act" }, {
      requestId: "req",
      agentId: "mock",
      signal: new AbortController().signal,
    });
    expect(result).toEqual({ ok: true, output: { name: "knowledge.search", input: { query: "act" } } });
    expect(registry.list()).toEqual([{ name: "knowledge.search", description: "Search local knowledge" }]);
    expect(registry.get("missing")).toBeUndefined();
  });
});
