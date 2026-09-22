import { describe, expect, it } from "vitest";
import { createLogger } from "../../platform/agent-hub/src/log";
import { ProviderCallError } from "../../platform/agent-hub/src/providers/errors";
import { createLocalProvider, createOpenaiProvider } from "../../platform/agent-hub/src/providers/disabled";
import { createMockProvider } from "../../platform/agent-hub/src/providers/mock";
import {
  OPENROUTER_API_URL,
  OPENROUTER_PINNED_MODEL,
  createOpenRouterProvider,
  openRouterModel,
} from "../../platform/agent-hub/src/providers/openrouter";
import { createModelRouter } from "../../platform/agent-hub/src/providers/router";
import type { ModelProvider, ModelRequest, ModelResponse } from "../../platform/agent-hub/src/providers/types";

const KEY = "super-secret-openrouter-key";

function messages(): ModelRequest["messages"] {
  return [
    { role: "system", content: "Be brief." },
    { role: "user", content: "Какво е член 4?" },
  ];
}

function successPayload(text = "Член 4 изисква AI грамотност.") {
  return {
    provider: "Example Upstream",
    model: OPENROUTER_PINNED_MODEL,
    choices: [{ message: { role: "assistant", content: text, reasoning: "hidden chain of thought" } }],
    usage: { prompt_tokens: 120, completion_tokens: 40, cost: 0.00021 },
  };
}

describe("openrouter provider", () => {
  it("sends the pinned model, bearer auth, and privacy routing", async () => {
    let url = "";
    let init: RequestInit | undefined;
    const provider = createOpenRouterProvider({
      env: {
        OPENROUTER_API_KEY: KEY,
        OPENROUTER_MODEL: "z-ai/glm-5.3-flash:latest",
        OPENROUTER_SITE_URL: "https://ittdigitalhub.org",
        OPENROUTER_APP_NAME: "ITT Digital Hub",
      },
      fetchImpl: async (input, requestInit) => {
        url = String(input);
        init = requestInit;
        return Response.json(successPayload());
      },
    });

    const result = await provider.complete({ provider: "openrouter", messages: messages() });
    const headers = new Headers(init?.headers);
    const body = JSON.parse(String(init?.body)) as {
      model?: string;
      models?: unknown;
      provider?: { zdr?: boolean; data_collection?: string; allow_fallbacks?: boolean; only?: unknown };
      max_tokens?: number;
      reasoning?: { effort?: string; enabled?: boolean };
      messages?: Array<{ role: string; content: string }>;
    };

    expect(url).toBe(OPENROUTER_API_URL);
    expect(url.includes(KEY)).toBe(false);
    expect(headers.get("authorization")).toBe(`Bearer ${KEY}`);
    expect(headers.get("http-referer")).toBe("https://ittdigitalhub.org");
    expect(headers.get("x-openrouter-title")).toBe("ITT Digital Hub");
    expect(body.model).toBe(OPENROUTER_PINNED_MODEL);
    expect(body.models).toBeUndefined();
    expect(body.max_tokens).toBe(2048);
    expect(body.reasoning).toEqual({ effort: "low" });
    expect(body.provider).toEqual({ zdr: true, data_collection: "deny", allow_fallbacks: true });
    expect(body.provider?.only).toBeUndefined();
    expect(body.messages?.map((message) => message.role)).toEqual(["system", "user"]);
    expect(result).toMatchObject({
      text: "Член 4 изисква AI грамотност.",
      provider: "openrouter",
      model: OPENROUTER_PINNED_MODEL,
      upstreamProvider: "Example Upstream",
      usage: { inputTokens: 120, outputTokens: 40, cost: 0.00021 },
    });
    expect(result.text.includes("hidden chain")).toBe(false);
    expect(JSON.stringify(result).includes(KEY)).toBe(false);
  });

  it("keeps an explicit pinned slug and ignores latest aliases", () => {
    expect(openRouterModel(undefined, {})).toBe(OPENROUTER_PINNED_MODEL);
    expect(openRouterModel("z-ai/glm-5.3-flash", {})).toBe(OPENROUTER_PINNED_MODEL);
    expect(openRouterModel("z-ai/glm-5.3-flash:latest", { OPENROUTER_MODEL: "openrouter/free" })).toBe(
      OPENROUTER_PINNED_MODEL,
    );
  });

  it("does not call the network when the key is missing", async () => {
    let called = false;
    const provider = createOpenRouterProvider({
      env: {},
      fetchImpl: async () => {
        called = true;
        return Response.json(successPayload());
      },
    });
    await expect(provider.complete({ provider: "openrouter", messages: messages() })).rejects.toMatchObject({
      code: "not_configured",
    });
    expect(called).toBe(false);
  });

  it("maps 429, 5xx, privacy 404, and malformed responses without leaking payloads", async () => {
    const cases: Array<{ status: number; body: unknown; code: string; calls: number }> = [
      { status: 429, body: { error: { message: KEY } }, code: "rate_limited", calls: 1 },
      { status: 502, body: { error: { message: "upstream https://secret.internal " + KEY } }, code: "provider_error", calls: 1 },
      { status: 503, body: { error: { message: "unavailable" } }, code: "provider_error", calls: 1 },
      {
        status: 404,
        body: { error: { message: "No allowed providers are available" } },
        code: "provider_error",
        calls: 1,
      },
      { status: 200, body: { choices: [{ message: { content: "  ", reasoning: "secret reasoning" } }] }, code: "provider_error", calls: 1 },
      { status: 200, body: { model: "google/gemini-2.5-flash", choices: [{ message: { content: "wrong model" } }] }, code: "provider_error", calls: 1 },
    ];

    for (const item of cases) {
      let calls = 0;
      let privacy: unknown;
      const provider = createOpenRouterProvider({
        env: { OPENROUTER_API_KEY: KEY },
        fetchImpl: async (_input, requestInit) => {
          calls += 1;
          privacy = JSON.parse(String(requestInit?.body)).provider;
          return Response.json(item.body, { status: item.status });
        },
      });
      try {
        await provider.complete({ provider: "openrouter", model: OPENROUTER_PINNED_MODEL, messages: messages() });
        throw new Error("expected provider failure");
      } catch (error) {
        expect(error).toMatchObject({ code: item.code });
        expect(String(error).includes(KEY)).toBe(false);
        expect(String(error).includes("secret.internal")).toBe(false);
        expect(String(error).includes("secret reasoning")).toBe(false);
        expect(String(error).includes("wrong model")).toBe(false);
      }
      expect(calls).toBe(item.calls);
      expect(privacy).toEqual({ zdr: true, data_collection: "deny", allow_fallbacks: true });
    }
  });

  it("maps timeouts and network failures", async () => {
    const timeout = createOpenRouterProvider({
      env: { OPENROUTER_API_KEY: KEY },
      timeoutMs: 20,
      fetchImpl: (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    });
    await expect(timeout.complete({ provider: "openrouter", messages: messages() })).rejects.toMatchObject({
      code: "timeout",
    });

    const network = createOpenRouterProvider({
      env: { OPENROUTER_API_KEY: KEY },
      fetchImpl: async () => {
        throw new TypeError("socket hang up");
      },
    });
    await expect(network.complete({ provider: "openrouter", messages: messages() })).rejects.toMatchObject({
      code: "network",
    });
  });
});

describe("model router fallback", () => {
  function provider(id: "openrouter" | "gemini", steps: Array<{ text: string } | { code: "not_configured" | "provider_error" | "rate_limited" }>): {
    provider: ModelProvider;
    calls: number;
  } {
    let calls = 0;
    return {
      get calls() {
        return calls;
      },
      provider: {
        id,
        async complete(request): Promise<ModelResponse> {
          calls += 1;
          const step = steps[calls - 1];
          if (!step || "code" in step) throw new ProviderCallError(id, step?.code ?? "provider_error", 503);
          return { text: step.text, provider: id, model: request.model ?? id, usage: { inputTokens: 3, outputTokens: 2 } };
        },
      },
    };
  }

  function router(primary: ModelProvider, fallback: ModelProvider, lines: string[] = []) {
    return createModelRouter(
      {
        mock: createMockProvider(),
        local: createLocalProvider(),
        openai: createOpenaiProvider(),
        openrouter: primary,
        gemini: fallback,
      },
      {
        log: createLogger({
          level: "info",
          write: (line) => {
            lines.push(line);
          },
        }),
      },
    );
  }

  const request: ModelRequest = {
    provider: "openrouter",
    model: OPENROUTER_PINNED_MODEL,
    fallback: { provider: "gemini", model: "gemini-3.8-flash" },
    call: { requestId: "req-1", agentId: "ai-act" },
    messages: messages(),
  };

  it("returns a successful GLM answer without calling Gemini", async () => {
    const lines: string[] = [];
    const primary = provider("openrouter", [{ text: "Кратък отговор." }]);
    const fallback = provider("gemini", [{ text: "unused" }]);
    const result = await router(primary.provider, fallback.provider, lines).complete(request);
    expect(result).toMatchObject({
      text: "Кратък отговор.",
      provider: "openrouter",
      model: OPENROUTER_PINNED_MODEL,
      fallbackUsed: false,
    });
    expect(fallback.calls).toBe(0);
    const event = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(event).toMatchObject({
      message: "model",
      requestId: "req-1",
      agentId: "ai-act",
      provider: "openrouter",
      model: OPENROUTER_PINNED_MODEL,
      outcome: "ok",
      fallbackUsed: false,
      inputTokens: 3,
      outputTokens: 2,
    });
    expect(JSON.stringify(event).includes("Какво е член 4")).toBe(false);
    expect(JSON.stringify(event).includes("Be brief")).toBe(false);
  });

  it("falls back to Gemini for provider failure and not for a short answer", async () => {
    const failed = provider("openrouter", [{ code: "provider_error" }]);
    const gemini = provider("gemini", [{ text: "Резервен отговор." }]);
    const result = await router(failed.provider, gemini.provider).complete(request);
    expect(result).toMatchObject({ text: "Резервен отговор.", provider: "gemini", model: "gemini-3.8-flash", fallbackUsed: true });
    expect(failed.calls).toBe(1);
    expect(gemini.calls).toBe(1);

    const shortPrimary = provider("openrouter", [{ text: "Да." }]);
    const unused = provider("gemini", [{ text: "unused" }]);
    const short = await router(shortPrimary.provider, unused.provider).complete(request);
    expect(short.text).toBe("Да.");
    expect(short.fallbackUsed).toBe(false);
    expect(unused.calls).toBe(0);
  });

  it("does not fall back when OpenRouter is not configured, and fails closed when both providers fail", async () => {
    const missing = provider("openrouter", [{ code: "not_configured" }]);
    const gemini = provider("gemini", [{ text: "should not run" }]);
    await expect(router(missing.provider, gemini.provider).complete(request)).rejects.toMatchObject({ code: "not_configured" });
    expect(gemini.calls).toBe(0);

    const primary = provider("openrouter", [{ code: "rate_limited" }]);
    const down = provider("gemini", [{ code: "provider_error" }]);
    await expect(router(primary.provider, down.provider).complete(request)).rejects.toMatchObject({
      code: "provider_error",
      providerId: "gemini",
    });
    expect(primary.calls).toBe(1);
    expect(down.calls).toBe(1);
  });
});
