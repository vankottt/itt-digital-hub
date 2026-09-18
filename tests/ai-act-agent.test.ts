import { describe, expect, it } from "vitest";
import { readAiActConfig, providerKeyConfigured } from "../src/lib/ai-act/config";
import { parseChatRequest } from "../src/lib/ai-act/chat-request";
import { parseLeadPayload } from "../src/lib/ai-act/lead";
import { readCampaignParams } from "../src/lib/ai-act/campaign";
import { AGENT_KIT_FILES, getInstallerPrompt } from "../src/lib/ai-act/kit";
import { needsLeadGate, remainingAnonymousQuestions, createBlankSession } from "../src/lib/ai-act/session";
import { href, isAiActAgentEntryPath, isAiActAgentPath } from "../src/lib/paths";
import { aiActAgent } from "../src/content/ai-act-agent";
import { installerPrompt } from "../src/content/ai-act-kit/installer-prompt";
import { googleProvider } from "../src/lib/ai-act/providers/google";
import { openaiProvider } from "../src/lib/ai-act/providers/openai";
import { AiActProviderError } from "../src/lib/ai-act/errors";

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
    expect(config.googleKeyConfigured).toBe(false);
    expect(providerKeyConfigured(config)).toBe(false);
  });

  it("selects openai through the same config shape", () => {
    const config = readAiActConfig({ AI_PROVIDER: "openai", AI_MODEL: "gpt-4.1-mini", OPENAI_API_KEY: "sk-test" });
    expect(config.provider).toBe("openai");
    expect(config.model).toBe("gpt-4.1-mini");
    expect(config.openaiKeyConfigured).toBe(true);
  });
});

describe("providers", () => {
  it("stay unimplemented in Goal 1 even when a key is present", async () => {
    const previous = process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_AI_API_KEY = "test-key";
    try {
      await expect(googleProvider.complete({ system: "", messages: [], model: "gemini-3.8-flash" })).rejects.toBeInstanceOf(
        AiActProviderError,
      );
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
});

describe("agent kit", () => {
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

  it("uses one installer prompt source", () => {
    expect(getInstallerPrompt("bg")).toBe(installerPrompt.bg);
    expect(getInstallerPrompt("en")).toBe(installerPrompt.en);
  });
});

describe("product copy", () => {
  it("keeps the compact chat notice exact in Bulgarian", () => {
    expect(aiActAgent.chat.notice.bg).toBe(
      "При използваната конфигурация въведеното съдържание може да бъде използвано от AI доставчика за подобряване на услугите му. Не споделяйте лична, поверителна или чувствителна информация.",
    );
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
