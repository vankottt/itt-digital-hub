import { ProviderCallError } from "./errors";
import type { ModelMessage, ModelProvider, ModelResponse, ModelUsage } from "./types";

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { status?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

export interface GeminiProviderOptions {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

export function createGeminiProvider(options: GeminiProviderOptions = {}): ModelProvider {
  return {
    id: "gemini",
    async complete(request) {
      const env = options.env ?? process.env;
      const key = geminiApiKey(env);
      if (!key) throw new ProviderCallError("gemini", "not_configured");

      const model = (request.model?.trim() || env.AI_MODEL?.trim() || GEMINI_DEFAULT_MODEL).replace(/^models\//, "");
      const timeoutMs = options.timeoutMs ?? readTimeout(env.AI_TIMEOUT_MS);
      const fetchImpl = options.fetchImpl ?? fetch;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const { system, contents } = toGeminiContents(request.messages);
      const bodyFor = (includeThinking: boolean) =>
        JSON.stringify({
          ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}),
          contents,
          ...(includeThinking ? { generationConfig: { thinkingConfig: { thinkingLevel: "low" } } } : {}),
        });

      const generate = (includeThinking: boolean) =>
        providerFetch(
          fetchImpl,
          url,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-goog-api-key": key,
            },
            body: bodyFor(includeThinking),
          },
          timeoutMs,
          request.signal,
        );

      let response = await generate(true);
      if (response.status === 400) {
        await response.body?.cancel();
        response = await generate(false);
      }
      if (response.status === 500 || response.status === 503) {
        await response.body?.cancel();
        await delay(400, request.signal);
        response = await generate(false);
      }

      let payload: GeminiResponse = {};
      try {
        payload = (await response.json()) as GeminiResponse;
      } catch {
        payload = {};
      }

      if (response.status === 401 || response.status === 403) {
        throw new ProviderCallError("gemini", "not_configured", response.status);
      }
      if (
        response.status === 429 ||
        response.status === 503 ||
        payload.error?.status === "RESOURCE_EXHAUSTED" ||
        payload.error?.status === "UNAVAILABLE"
      ) {
        throw new ProviderCallError("gemini", "rate_limited", response.status);
      }
      if (!response.ok) {
        throw new ProviderCallError("gemini", "provider_error", response.status);
      }
      if (payload.promptFeedback?.blockReason) {
        throw new ProviderCallError("gemini", "provider_error", response.status);
      }

      const text = extractText(payload);
      if (!text) throw new ProviderCallError("gemini", "provider_error", response.status);
      const usage = readGeminiUsage(payload);
      return { text, provider: "gemini", model, ...(usage ? { usage } : {}) } satisfies ModelResponse;
    },
  };
}

export function geminiApiKey(env: Record<string, string | undefined>): string | undefined {
  const key = env.GOOGLE_AI_API_KEY?.trim() || env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

function toGeminiContents(messages: ModelMessage[]): {
  system: string;
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
} {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: message.content }],
    }));
  return { system, contents };
}

function readGeminiUsage(payload: GeminiResponse): ModelUsage | undefined {
  const inputTokens = finiteCount(payload.usageMetadata?.promptTokenCount);
  const outputTokens = finiteCount(payload.usageMetadata?.candidatesTokenCount);
  if (inputTokens === undefined && outputTokens === undefined) return undefined;
  return {
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
  };
}

function finiteCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  return Math.round(value);
}

function extractText(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function readTimeout(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20_000;
  return Math.min(25_000, Math.max(5_000, parsed));
}

async function providerFetch(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
  parent?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onParent = () => controller.abort();
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", onParent, { once: true });
  }
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "AbortError" || name === "TimeoutError") {
      throw new ProviderCallError("gemini", "timeout");
    }
    throw new ProviderCallError("gemini", "network");
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onParent);
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new ProviderCallError("gemini", "timeout"));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new ProviderCallError("gemini", "timeout"));
      },
      { once: true },
    );
  });
}
