import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createAiActAgent } from "../../platform/agent-hub/agents/ai-act/handler";
import { leadFromInput, leadStorageTarget, toSupabaseRow } from "../../platform/agent-hub/agents/ai-act/store";
import type { Agent } from "../../platform/agent-hub/src/agent";
import { createLocalProvider, createOpenaiProvider } from "../../platform/agent-hub/src/providers/disabled";
import { ProviderCallError, type ProviderCallCode } from "../../platform/agent-hub/src/providers/errors";
import { createGeminiProvider } from "../../platform/agent-hub/src/providers/gemini";
import { createMockProvider } from "../../platform/agent-hub/src/providers/mock";
import { createModelRouter } from "../../platform/agent-hub/src/providers/router";
import type { ModelProvider, ModelRequest } from "../../platform/agent-hub/src/providers/types";
import { createAgentRegistry } from "../../platform/agent-hub/src/registry";
import { handleHubRequest, type HubRuntime } from "../../platform/agent-hub/src/server";
import type { AiActLeadInput, StoredAiActLead } from "../../src/lib/ai-act/types";
import { readError, runtimeWith, signedHubRequest } from "./helpers";

const GATE_SECRET = "test-gate-secret-value";
const NOW = new Date("2026-01-01T00:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

function scriptedProvider(
  id: "openrouter" | "gemini",
  steps: Array<{ text: string } | { code: ProviderCallCode; status?: number }>,
): { provider: ModelProvider; calls: ModelRequest[] } {
  const calls: ModelRequest[] = [];
  let index = 0;
  return {
    calls,
    provider: {
      id,
      async complete(request) {
        calls.push(request);
        const step = steps[Math.min(index, steps.length - 1)];
        index += 1;
        if (!step) throw new ProviderCallError(id, "provider_error");
        if ("code" in step) throw new ProviderCallError(id, step.code, step.status);
        return {
          text: step.text,
          provider: id,
          model: request.model ?? (id === "openrouter" ? "z-ai/glm-5.3-flash" : "gemini-3.8-flash"),
        };
      },
    },
  };
}

function scriptedGemini(steps: Array<{ text: string } | { status: number }>): { provider: ModelProvider; calls: ModelRequest[] } {
  return scriptedProvider(
    "gemini",
    steps.map((step) => ("status" in step ? { code: "rate_limited" as const, status: step.status } : step)),
  );
}

function runtimeFor(
  provider: ModelProvider,
  lines: string[] = [],
  deps: { persist?: (input: AiActLeadInput) => Promise<StoredAiActLead>; notify?: (lead: StoredAiActLead) => Promise<void> } = {},
  fallback: ModelProvider = {
    id: "gemini",
    async complete() {
      throw new Error("unexpected gemini call");
    },
  },
): HubRuntime {
  const agent: Agent = createAiActAgent({
    env: { AI_ACT_GATE_SECRET: GATE_SECRET, AI_MODEL: "gemini-3.8-flash", NODE_ENV: "test" },
    persist: deps.persist,
    notify: deps.notify,
  });
  return runtimeWith(lines, {
    now: () => NOW,
    registry: createAgentRegistry([agent]),
    models: createModelRouter({
      mock: createMockProvider(),
      local: createLocalProvider(),
      openrouter: provider,
      gemini: fallback,
      openai: createOpenaiProvider(),
    }),
  });
}

async function postChat(runtime: HubRuntime, message: string, extra: Record<string, unknown> = {}, locale = "bg") {
  return handleHubRequest(
    await signedHubRequest({
      path: "/v1/agents/ai-act/chat",
      timestamp: NOW_SECONDS,
      rawBody: JSON.stringify({ locale, message, sessionId: "session-1234", ...extra }),
    }),
    runtime,
  );
}

async function postAction(runtime: HubRuntime, actionId: string, body: Record<string, unknown>) {
  return handleHubRequest(
    await signedHubRequest({
      path: `/v1/agents/ai-act/actions/${actionId}`,
      timestamp: NOW_SECONDS,
      rawBody: JSON.stringify(body),
    }),
    runtime,
  );
}

const leadInput = {
  name: "Goal Two",
  workEmail: "goal2-migration-test@example.com",
  company: "ITT Digital Hub Test",
  role: "Tester",
  locale: "en",
  anonymousSessionId: "session-1234",
};

describe("ai-act agent", () => {
  it("registers a public bg/en agent", () => {
    const agent = createAgentRegistry().get("ai-act");
    expect(agent?.manifest).toMatchObject({
      id: "ai-act",
      enabled: true,
      visibility: "public",
      locales: ["bg", "en"],
      modelPolicy: {
        provider: "openrouter",
        model: "z-ai/glm-5.3-flash",
        fallback: { provider: "gemini", model: "gemini-3.8-flash" },
      },
    });
  });

  it("grounds a Bulgarian request in the existing prompt and knowledge", async () => {
    const script = scriptedProvider("openrouter", [{ text: "Кратък отговор." }]);
    const response = await postChat(runtimeFor(script.provider), "Какво означава член 4?");
    expect(response.status).toBe(200);
    const body = (await response.json()) as { answer: string; state: { questionsAsked: number; questionsRemaining: number } };
    expect(body.answer).toBe("Кратък отговор.");
    expect(body.state.questionsAsked).toBe(1);
    expect(body.state.questionsRemaining).toBe(1);
    const system = script.calls[0]?.messages.find((message) => message.role === "system")?.content ?? "";
    expect(system.includes("Отговаряй на български")).toBe(true);
    expect(system.includes("# SYSTEM_PROMPT")).toBe(true);
    expect(system.includes("# AGENT_CONFIG")).toBe(true);
    expect(system.includes("Trusted knowledge pack")).toBe(true);
    expect(system.includes("sources/")).toBe(true);
    expect(script.calls[0]?.provider).toBe("openrouter");
    expect(script.calls[0]?.model).toBe("z-ai/glm-5.3-flash");
    expect(script.calls).toHaveLength(1);
  });

  it("uses the English locale directive", async () => {
    const script = scriptedProvider("openrouter", [{ text: "A short answer." }]);
    const response = await postChat(runtimeFor(script.provider), "What does Article 4 mean?", {}, "en");
    expect(response.status).toBe(200);
    const system = script.calls[0]?.messages.find((message) => message.role === "system")?.content ?? "";
    expect(system.includes("Answer in English")).toBe(true);
    expect(script.calls[0]?.model).toBe("z-ai/glm-5.3-flash");
  });

  it("allows two successful questions and then requires a lead", async () => {
    const script = scriptedProvider("openrouter", [{ text: "First." }, { text: "Second." }, { text: "Third." }]);
    const runtime = runtimeFor(script.provider);
    const first = await postChat(runtime, "First question about Article 4");
    const firstBody = (await first.json()) as { state: { gate: string; questionsAsked: number } };
    expect(firstBody.state.questionsAsked).toBe(1);

    const second = await postChat(runtime, "Second question about literacy", { clientState: { gate: firstBody.state.gate } });
    const secondBody = (await second.json()) as { answer: string; state: { questionsAsked: number; questionsRemaining: number; leadRequired: boolean; gate: string } };
    expect(secondBody.answer).toBe("Second.");
    expect(secondBody.state.questionsAsked).toBe(2);
    expect(secondBody.state.questionsRemaining).toBe(0);
    expect(secondBody.state.leadRequired).toBe(true);

    const third = await postChat(runtime, "Third question", { clientState: { gate: secondBody.state.gate } });
    expect(third.status).toBe(403);
    expect((await readError(third)).error.code).toBe("LEAD_REQUIRED");
    expect(script.calls).toHaveLength(2);
  });

  it("consumes one question when OpenRouter fails and Gemini answers", async () => {
    const primary = scriptedProvider("openrouter", [{ code: "provider_error", status: 404 }]);
    const fallback = scriptedProvider("gemini", [{ text: "Резервен отговор." }]);
    const runtime = runtimeFor(primary.provider, [], {}, fallback.provider);
    const response = await postChat(runtime, "Какво означава член 4?");
    const body = (await response.json()) as { answer: string; state: { questionsAsked: number; questionsRemaining: number } };
    expect(response.status).toBe(200);
    expect(body.answer).toBe("Резервен отговор.");
    expect(body.state.questionsAsked).toBe(1);
    expect(body.state.questionsRemaining).toBe(1);
    expect(primary.calls).toHaveLength(1);
    expect(fallback.calls).toHaveLength(1);
    expect(fallback.calls[0]?.model).toBe("gemini-3.8-flash");
    expect(JSON.stringify(body)).not.toContain("openrouter");
  });

  it("does not consume allowance when OpenRouter and Gemini both fail", async () => {
    for (const failure of [
      { code: "rate_limited" as const, status: 429, http: 429, error: "RATE_LIMITED" },
      { code: "provider_error" as const, status: 503, http: 503, error: "PROVIDER_UNAVAILABLE" },
    ]) {
      const primary = scriptedProvider("openrouter", [{ text: "Opened." }, { code: failure.code, status: failure.status }]);
      const fallback = scriptedProvider("gemini", [{ code: failure.code, status: failure.status }]);
      const runtime = runtimeFor(primary.provider, [], {}, fallback.provider);
      const opened = await postChat(runtime, "Opening question");
      const gate = ((await opened.json()) as { state: { gate: string } }).state.gate;

      const failed = await postChat(runtime, "Rate limited question", { clientState: { gate } });
      const failedBody = (await failed.json()) as { error?: { code?: string }; state?: { questionsAsked?: number } };
      expect(failed.status).toBe(failure.http);
      expect(failedBody.error?.code).toBe(failure.error);
      expect(failedBody.state?.questionsAsked).toBeUndefined();
      expect(primary.calls).toHaveLength(2);
      expect(fallback.calls).toHaveLength(1);

      const recovered = scriptedProvider("openrouter", [{ text: "Recovered." }]);
      const recoveredRuntime = runtimeFor(recovered.provider, [], {}, fallback.provider);
      const retry = await postChat(recoveredRuntime, "Retry question", { clientState: { gate } });
      const body = (await retry.json()) as { state: { questionsAsked: number } };
      expect(retry.status).toBe(200);
      expect(body.state.questionsAsked).toBe(2);
    }
  });

  it("rejects an unsigned lead action", async () => {
    const runtime = runtimeFor(scriptedGemini([{ text: "unused" }]).provider);
    const response = await handleHubRequest(
      await signedHubRequest({
        path: "/v1/agents/ai-act/actions/lead",
        timestamp: NOW_SECONDS,
        signature: "ab".repeat(32),
        rawBody: JSON.stringify({ locale: "en", input: leadInput }),
      }),
      runtime,
    );
    expect((await readError(response)).error.code).toBe("INVALID_SIGNATURE");
  });

  it("validates a lead, keeps marketing consent optional, and unlocks the gate", async () => {
    const stored: AiActLeadInput[] = [];
    const notified: string[] = [];
    const runtime = runtimeFor(scriptedGemini([{ text: "unused" }]).provider, [], {
      persist: async (input) => {
        stored.push(input);
        return leadFromInput(input, "lead-1", "2026-01-01T00:00:00.000Z");
      },
      notify: async (lead) => {
        notified.push(lead.workEmail);
      },
    });

    const invalid = await postAction(runtime, "lead", { locale: "en", input: { name: "Only" } });
    expect(invalid.status).toBe(400);
    expect((await readError(invalid)).error.code).toBe("INVALID_BODY");
    expect(stored).toHaveLength(0);

    const lines: string[] = [];
    const logged = runtimeFor(scriptedGemini([{ text: "unused" }]).provider, lines, {
      persist: async (input) => {
        stored.push(input);
        return leadFromInput(input, "lead-1", "2026-01-01T00:00:00.000Z");
      },
      notify: async () => {
        throw new Error("mailbox down");
      },
    });
    const accepted = await postAction(logged, "lead", {
      locale: "en",
      sessionId: "session-1234",
      input: { ...leadInput, website: "" },
    });
    expect(accepted.status).toBe(200);
    const body = (await accepted.json()) as { result: { persisted: boolean }; state: { leadCaptured: boolean; gate: string } };
    expect(body.result.persisted).toBe(true);
    expect(body.state.leadCaptured).toBe(true);
    expect(stored.at(-1)?.marketingConsent).toBe(false);
    expect(JSON.stringify(lines)).not.toContain("goal2-migration-test@example.com");

    const spam = await postAction(logged, "lead", { locale: "en", input: { ...leadInput, website: "https://spam.example" } });
    expect(spam.status).toBe(200);
    expect(stored).toHaveLength(1);

    const kit = await postAction(logged, "authorize", {
      locale: "en",
      input: { purpose: "kit" },
      clientState: { gate: body.state.gate },
    });
    expect(kit.status).toBe(200);
    expect(notified).toHaveLength(0);
  });

  it("maps a Supabase lead row and does not store locally in test or production", () => {
    const lead = leadFromInput(
      { ...leadInput, marketingConsent: true, locale: "bg", campaign: "summit" },
      "lead-1",
      "2026-01-01T00:00:00.000Z",
    );
    expect(toSupabaseRow(lead)).toEqual({
      id: "lead-1",
      name: "Goal Two",
      work_email: "goal2-migration-test@example.com",
      company: "ITT Digital Hub Test",
      role: "Tester",
      marketing_consent: true,
      session_id: "session-1234",
      source: "hosted_assistant",
      campaign: "summit",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    expect(leadStorageTarget({ NODE_ENV: "test" })).toBe("unavailable");
    expect(leadStorageTarget({ NODE_ENV: "production" })).toBe("unavailable");
    expect(
      leadStorageTarget({
        NODE_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe("supabase");
  });

  it("keeps the Vercel chat and lead routes from calling the old runtime", () => {
    const chat = readFileSync("src/app/api/ai-act/chat/route.ts", "utf8");
    const lead = readFileSync("src/app/api/ai-act/lead/route.ts", "utf8");
    expect(chat.includes("completeAiActChat")).toBe(false);
    expect(chat.includes("generativelanguage")).toBe(false);
    expect(lead.includes("persistLead")).toBe(false);
    expect(lead.includes("notifyLead")).toBe(false);
  });
});

describe("gemini provider", () => {
  const key = "super-secret-gemini-key";

  it("returns text for a successful generateContent response and keeps the key out of the URL", async () => {
    let url = "";
    const provider = createGeminiProvider({
      env: { GOOGLE_AI_API_KEY: key },
      fetchImpl: async (input) => {
        url = String(input);
        return Response.json({
          candidates: [{ content: { parts: [{ thought: true, text: "hidden" }, { text: "Visible answer" }] } }],
          usageMetadata: { promptTokenCount: 11, candidatesTokenCount: 5 },
        });
      },
    });
    const result = await provider.complete({
      provider: "gemini",
      model: "gemini-3.8-flash",
      messages: [
        { role: "system", content: "Be brief." },
        { role: "user", content: "Hello" },
      ],
    });
    expect(result).toMatchObject({
      text: "Visible answer",
      provider: "gemini",
      model: "gemini-3.8-flash",
      usage: { inputTokens: 11, outputTokens: 5 },
    });
    expect(url.includes(key)).toBe(false);
    expect(url.includes("/models/gemini-3.8-flash:generateContent")).toBe(true);
  });

  it("maps HTTP 429 without a retry and HTTP 503 after the existing retry", async () => {
    let limited = 0;
    const rateLimited = createGeminiProvider({
      env: { GEMINI_API_KEY: key },
      fetchImpl: async () => {
        limited += 1;
        return Response.json({ error: { status: "RESOURCE_EXHAUSTED" } }, { status: 429 });
      },
    });
    await expect(
      rateLimited.complete({ provider: "gemini", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toMatchObject({ code: "rate_limited", status: 429 });
    expect(limited).toBe(1);

    let unavailable = 0;
    const down = createGeminiProvider({
      env: { GOOGLE_AI_API_KEY: key },
      fetchImpl: async () => {
        unavailable += 1;
        return Response.json({ error: { status: "UNAVAILABLE" } }, { status: 503 });
      },
    });
    await expect(down.complete({ provider: "gemini", messages: [{ role: "user", content: "hi" }] })).rejects.toMatchObject({
      code: "rate_limited",
      status: 503,
    });
    expect(unavailable).toBe(2);

    try {
      await rateLimited.complete({ provider: "gemini", messages: [{ role: "user", content: "hi" }] });
    } catch (error) {
      expect(String(error).includes(key)).toBe(false);
    }
  });

  it("does not call the network when no key is configured", async () => {
    let called = false;
    const provider = createGeminiProvider({
      env: {},
      fetchImpl: async () => {
        called = true;
        return Response.json({});
      },
    });
    await expect(provider.complete({ provider: "gemini", messages: [{ role: "user", content: "hi" }] })).rejects.toMatchObject({
      code: "not_configured",
    });
    expect(called).toBe(false);
  });
});
