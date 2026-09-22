import { afterEach, describe, expect, it, vi } from "vitest";
import { readAiActConfig, providerKeyConfigured } from "../src/lib/ai-act/config";
import { parseChatRequest } from "../src/lib/ai-act/chat-request";
import { parseLeadPayload } from "../src/lib/ai-act/lead";
import { readCampaignParams } from "../src/lib/ai-act/campaign";
import { AGENT_KIT_FILES, AGENT_KIT_REQUIRED_PATHS, buildAgentKitZip, getInstallerPrompt, getPrimaryTestCase } from "../src/lib/ai-act/kit";
import { loadKitTree } from "../src/lib/ai-act/kit-files";
import { unzipEntries } from "../src/lib/ai-act/zip";
import { loadKnowledgeContext, loadSystemInstructions } from "../src/lib/ai-act/knowledge";
import { attachLead, createGateState, decodeGateState, encodeGateState, gateAllowsChat, incrementAnonymousCount } from "../src/lib/ai-act/gate-token";
import { needsLeadGate, remainingAnonymousQuestions, createBlankSession } from "../src/lib/ai-act/session";
import { href, isAiActAgentEntryPath, isAiActAgentPath } from "../src/lib/paths";
import { aiActAgent } from "../src/content/ai-act-agent";
import { googleProvider } from "../src/lib/ai-act/providers/google";
import { openaiProvider } from "../src/lib/ai-act/providers/openai";
import { leadStorageTarget } from "../src/lib/ai-act/lead-target";
import { notifyLead } from "../src/lib/ai-act/lead-notify";
import { AiActProviderError } from "../src/lib/ai-act/errors";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ai act routes", () => {
  it("builds bilingual product paths", () => {
    expect(href("bg", "ai-act-agent")).toBe("/bg/ai-act-agent");
    expect(href("en", "ai-act-agent", "use")).toBe("/en/ai-act-agent/use");
    expect(href("bg", "ai-act-agent", "build")).toBe("/bg/ai-act-agent/build");
    expect(isAiActAgentEntryPath("/bg/ai-act-agent")).toBe(true);
    expect(isAiActAgentEntryPath("/bg/ai-act-agent/use")).toBe(false);
    expect(isAiActAgentPath("/en/ai-act-agent/build")).toBe(true);
  });
});

describe("campaign params", () => {
  it("reads conference source identifiers", () => {
    const search = new URLSearchParams("src=conference");
    expect(readCampaignParams(search)).toEqual({ source: "conference", campaign: undefined });
  });

  it("falls back to utm fields", () => {
    const search = new URLSearchParams("utm_source=qr&utm_campaign=summit");
    expect(readCampaignParams(search)).toEqual({ source: "qr", campaign: "summit" });
  });
});

describe("lead gate", () => {
  it("allows two anonymous questions then requires a lead", () => {
    expect(needsLeadGate({ questionsAsked: 0, leadCaptured: false })).toBe(false);
    expect(needsLeadGate({ questionsAsked: 2, leadCaptured: false })).toBe(true);
    expect(needsLeadGate({ questionsAsked: 5, leadCaptured: true })).toBe(false);
    expect(remainingAnonymousQuestions({ questionsAsked: 1, leadCaptured: false })).toBe(1);
  });

  it("enforces the same limit on a signed server token", () => {
    const secret = "test-secret";
    let state = createGateState("sess-12345678");
    expect(gateAllowsChat(state)).toBe(true);
    state = incrementAnonymousCount(state);
    state = incrementAnonymousCount(state);
    expect(gateAllowsChat(state)).toBe(false);
    const roundtrip = decodeGateState(encodeGateState(state, secret), secret);
    expect(roundtrip?.q).toBe(2);
    expect(gateAllowsChat(attachLead(state, {
      name: "Иван",
      workEmail: "ivan@studio.bg",
      company: "Студио",
      role: "Проектант",
      marketingConsent: false,
    }))).toBe(true);
  });
});

describe("lead payload", () => {
  it("accepts the required work fields and optional marketing consent", () => {
    const parsed = parseLeadPayload({
      name: "Иван",
      workEmail: "ivan@studio.bg",
      company: "Студио",
      role: "Проектант",
      marketingConsent: false,
      locale: "bg",
      anonymousSessionId: "sess-12345678",
      journey: "use",
      source: "conference",
    });
    expect(parsed.kind).toBe("ok");
  });

  it("accepts a work email typed with the Bulgarian keyboard", () => {
    const parsed = parseLeadPayload({
      name: "йхг",
      workEmail: "гфдгд@гфхд.цом",
      company: "гфдхфд",
      role: "гфхфдх",
      marketingConsent: true,
      locale: "bg",
      anonymousSessionId: "sess-12345678",
    });
    expect(parsed.kind).toBe("ok");
    if (parsed.kind === "ok") expect(parsed.data.workEmail).toBe("gfdgd@gfhd.com");
  });

  it("treats a filled honeypot as spam", () => {
    expect(
      parseLeadPayload({
        website: "https://spam.example",
        name: "A",
        workEmail: "a@b.com",
        company: "C",
        role: "D",
        marketingConsent: true,
        locale: "en",
        anonymousSessionId: "sess-12345678",
      }).kind,
    ).toBe("spam");
  });
});

describe("chat request", () => {
  it("rejects empty messages", () => {
    expect(parseChatRequest({ sessionId: "sess-12345678", locale: "bg", messages: [] }).kind).toBe("invalid");
  });

  it("accepts a user turn", () => {
    const parsed = parseChatRequest({
      sessionId: "sess-12345678",
      locale: "bg",
      messages: [{ role: "user", content: "Какво означава член 4 за нашата фирма?" }],
    });
    expect(parsed.kind).toBe("ok");
  });
});

describe("provider config", () => {
  it("defaults to google gemini-3.8-flash without leaking keys", () => {
    const config = readAiActConfig({ AI_PROVIDER: "google" });
    expect(config.provider).toBe("google");
    expect(config.model).toBe("gemini-3.8-flash");
    expect(config.timeoutMs).toBeGreaterThan(0);
    expect(config.googleKeyConfigured).toBe(false);
    expect(providerKeyConfigured(config)).toBe(false);
  });

  it("treats GOOGLE_AI_API_KEY as canonical and GEMINI_API_KEY as alias", () => {
    expect(readAiActConfig({ GOOGLE_AI_API_KEY: "canonical" }).googleKeyConfigured).toBe(true);
    expect(readAiActConfig({ GEMINI_API_KEY: "alias" }).googleKeyConfigured).toBe(true);
    expect(readAiActConfig({}).googleKeyConfigured).toBe(false);
  });

  it("selects openai through the same config shape", () => {
    const config = readAiActConfig({ AI_PROVIDER: "openai", AI_MODEL: "gpt-4.1-mini", OPENAI_API_KEY: "sk-test" });
    expect(config.provider).toBe("openai");
    expect(config.model).toBe("gpt-4.1-mini");
    expect(config.openaiKeyConfigured).toBe(true);
  });
});

describe("providers", () => {
  it("maps a google completion to the shared contract", async () => {
    const previous = process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_AI_API_KEY = "test-key";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url).toContain("/models/gemini-3.8-flash:generateContent");
      expect(url).not.toContain("test-key");
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        system_instruction?: { parts?: Array<{ text?: string }> };
        contents?: unknown;
        generationConfig?: { thinkingConfig?: { thinkingLevel?: string } };
      };
      expect(body.system_instruction?.parts?.[0]?.text).toBe("trusted system");
      expect(body.contents).toEqual([{ role: "user", parts: [{ text: "Какво е член 4?" }] }]);
      expect(body.generationConfig?.thinkingConfig?.thinkingLevel).toBe("low");
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Член 4 изисква мерки за AI грамотност." }] } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const result = await googleProvider.complete({
        system: "trusted system",
        messages: [{ role: "user", content: "Какво е член 4?" }],
        model: "gemini-3.8-flash",
      });
      expect(result.provider).toBe("google");
      expect(result.model).toBe("gemini-3.8-flash");
      expect(result.text).toMatch(/член 4/i);
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_AI_API_KEY;
      else process.env.GOOGLE_AI_API_KEY = previous;
    }
  });

  it("reports not_configured when the openai key is missing", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      await expect(openaiProvider.complete({ system: "", messages: [], model: "gpt-4.1-mini" })).rejects.toMatchObject({
        code: "not_configured",
      });
    } finally {
      if (previous === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = previous;
    }
  });

  it("retries a google 503 once on the same model", async () => {
    const previous = process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_AI_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "unavailable" } }), { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Член 4 изисква мерки за AI грамотност." }] } }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const result = await googleProvider.complete({
        system: "",
        messages: [{ role: "user", content: "Какво е член 4?" }],
        model: "gemini-3.8-flash",
      });
      expect(result.text).toMatch(/член 4/i);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_AI_API_KEY;
      else process.env.GOOGLE_AI_API_KEY = previous;
    }
  });

  it("maps a persistent google 503 to rate_limited after the one retry", async () => {
    const previous = process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_AI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { status: "UNAVAILABLE" } }), { status: 503 })),
    );
    try {
      await expect(
        googleProvider.complete({ system: "", messages: [{ role: "user", content: "hi" }], model: "gemini-3.8-flash" }),
      ).rejects.toMatchObject({ code: "rate_limited" });
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_AI_API_KEY;
      else process.env.GOOGLE_AI_API_KEY = previous;
    }
  });

  it("maps google 429 to rate_limited without exposing provider text", async () => {
    const previous = process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_AI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 })),
    );
    try {
      await expect(
        googleProvider.complete({ system: "", messages: [{ role: "user", content: "hi" }], model: "gemini-3.8-flash" }),
      ).rejects.toBeInstanceOf(AiActProviderError);
      await expect(
        googleProvider.complete({ system: "", messages: [{ role: "user", content: "hi" }], model: "gemini-3.8-flash" }),
      ).rejects.toMatchObject({ code: "rate_limited" });
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_AI_API_KEY;
      else process.env.GOOGLE_AI_API_KEY = previous;
    }
  });
});

describe("knowledge and agent kit", () => {
  it("exposes the intended package structure", () => {
    expect(AGENT_KIT_FILES.map((file) => file.name)).toEqual([
      "README.md",
      "INSTALLER_PROMPT.md",
      "SYSTEM_PROMPT.md",
      "AGENT_CONFIG.md",
      "TEST_CASES.md",
      "VERSION.md",
      "sources/",
    ]);
  });

  it("loads real kit files and official sources", () => {
    const files = loadKitTree();
    const paths = files.map((file) => file.path);
    for (const name of AGENT_KIT_REQUIRED_PATHS) {
      expect(paths).toContain(name);
    }
    expect(files.some((file) => file.path.startsWith("sources/") && file.content.includes("2024/1689"))).toBe(true);
    const zip = unzipEntries(buildAgentKitZip());
    const names = zip.map((entry) => entry.name);
    expect(names).toEqual(expect.arrayContaining([...AGENT_KIT_REQUIRED_PATHS, "sources/00-source-index.md"]));
    expect(names.every((name) => name.endsWith(".md"))).toBe(true);
    expect(names.some((name) => name.includes(".env") || name.endsWith(".ts") || name.includes("node_modules"))).toBe(false);
    expect(zip.some((entry) => entry.name.startsWith("sources/") && entry.data.toString("utf8").includes("2024/1689"))).toBe(true);
  });

  it("uses the kit installer prompt and Article 4 test case", () => {
    expect(getInstallerPrompt("bg")).toContain("Не измисляйте собствена архитектура");
    expect(getInstallerPrompt("en")).toContain("Do not invent your own architecture");
    expect(getPrimaryTestCase("bg").question).toContain("член 4");
    expect(getPrimaryTestCase("en").question.toLowerCase()).toContain("article 4");
    expect(getPrimaryTestCase("bg").criteria.some((item) => item.includes("законово задължение"))).toBe(true);
    expect(getPrimaryTestCase("en").criteria.some((item) => /legal duty/i.test(item))).toBe(true);
  });

  it("attaches system instructions and knowledge instead of empty placeholders", () => {
    const system = loadSystemInstructions("bg");
    const knowledge = loadKnowledgeContext("bg");
    expect(system).toMatch(/not a lawyer|правен съвет/i);
    expect(knowledge.systemSupplement).toContain("Article 4");
    expect(knowledge.systemSupplement).toContain("digital-strategy.ec.europa.eu");
  });
});

describe("product copy", () => {
  it("keeps the compact chat notice exact in Bulgarian", () => {
    expect(aiActAgent.chat.notice.bg).toBe(
      "Въпросите може да се обработват от външни доставчици на AI модели. Не споделяйте лична, поверителна или чувствителна информация.",
    );
    expect(aiActAgent.chat.notice.en).toBe(
      "Questions may be processed by external AI model providers. Do not share personal, confidential or sensitive information.",
    );
  });

  it("states the two anonymous questions without asking for registration", () => {
    expect(aiActAgent.chat.remaining.two.bg).toBe("Задайте до 2 въпроса без регистрация.");
  });

  it("does not mention a model vendor in the visitor-facing strings", () => {
    const blob = JSON.stringify(aiActAgent);
    expect(blob.toLowerCase()).not.toMatch(/gemini|openai|google ai/);
  });

  it("starts with a blank client session rather than a fake persisted lead", () => {
    const session = createBlankSession();
    expect(session.leadCaptured).toBe(false);
    expect(session.kitDownloaded).toBe(false);
    expect(session.anonymousSessionId).toBe("");
  });
});

describe("lead persistence and notify", () => {
  it("does not use local files on Vercel without supabase", () => {
    expect(leadStorageTarget({ VERCEL: "1" })).toBe("unavailable");
    expect(leadStorageTarget({})).toBe("local");
    expect(
      leadStorageTarget({
        VERCEL: "1",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toBe("supabase");
  });

  it("skips notification when Resend is not configured", async () => {
    const previousKey = process.env.RESEND_API_KEY;
    const previousTo = process.env.CONTACT_TO_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    try {
      await notifyLead({
        id: "lead-1",
        name: "TEST",
        workEmail: "goal2@example.test",
        company: "ITT Test",
        role: "Tester",
        marketingConsent: false,
        sessionId: "sess-12345678",
        source: "hosted_assistant",
        createdAt: new Date().toISOString(),
      });
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      if (previousKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = previousKey;
      if (previousTo === undefined) delete process.env.CONTACT_TO_EMAIL;
      else process.env.CONTACT_TO_EMAIL = previousTo;
    }
  });
});
