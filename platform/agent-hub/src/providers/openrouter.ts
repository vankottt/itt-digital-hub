import { ProviderCallError } from "./errors";
import type { ModelMessage, ModelProvider, ModelResponse, ModelUsage } from "./types";

interface OpenRouterChoice {
  message?: {
    content?: unknown;
    reasoning?: unknown;
  };
}

interface OpenRouterResponse {
  model?: unknown;
  provider?: unknown;
  choices?: OpenRouterChoice[];
  usage?: unknown;
  error?: { message?: unknown };
}

export interface OpenRouterProviderOptions {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_PINNED_MODEL = "z-ai/glm-5.3-flash";

const DEFAULT_SITE_URL = "https://ittdigitalhub.org";
const DEFAULT_APP_NAME = "ITT Digital Hub";
/**
 * GLM reasoning is mandatory and, by default, uses the maximum effort.
 * That effort is taken from this budget, so the budget has to leave room
 * for the visible answer. The hub stops the request at 40s.
 */
const MAX_OUTPUT_TOKENS = 2048;
const PROVIDER_TIMEOUT_MS = 40_000;

export function createOpenRouterProvider(options: OpenRouterProviderOptions = {}): ModelProvider {
  return {
    id: "openrouter",
    async complete(request) {
      const env = options.env ?? process.env;
      const key = openRouterApiKey(env);
      if (!key) throw new ProviderCallError("openrouter", "not_configured");

      const model = openRouterModel(request.model, env);
      const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
      const fetchImpl = options.fetchImpl ?? fetch;
      const site = env.OPENROUTER_SITE_URL?.trim() || DEFAULT_SITE_URL;
      const appName = env.OPENROUTER_APP_NAME?.trim() || DEFAULT_APP_NAME;

      const response = await providerFetch(
        fetchImpl,
        OPENROUTER_API_URL,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${key}`,
            "content-type": "application/json",
            "http-referer": site,
            "x-openrouter-title": appName,
          },
          body: JSON.stringify({
            model,
            messages: toOpenRouterMessages(request.messages),
            max_tokens: MAX_OUTPUT_TOKENS,
            reasoning: { effort: "low" },
            provider: {
              zdr: true,
              data_collection: "deny",
              allow_fallbacks: true,
            },
          }),
        },
        timeoutMs,
        request.signal,
      );

      let payload: OpenRouterResponse = {};
      try {
        payload = (await response.json()) as OpenRouterResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new ProviderCallError("openrouter", statusCode(response.status), response.status);
      }
      if (payload.error) {
        throw new ProviderCallError("openrouter", "provider_error", response.status);
      }
      if (typeof payload.model === "string" && payload.model.trim() !== model) {
        throw new ProviderCallError("openrouter", "provider_error", response.status);
      }

      const text = messageText(payload.choices?.[0]?.message?.content);
      if (!text) throw new ProviderCallError("openrouter", "provider_error", response.status);

      const usage = readUsage(payload.usage);
      const upstreamProvider = safeUpstream(payload.provider);
      return {
        text,
        provider: "openrouter",
        model,
        ...(usage ? { usage } : {}),
        ...(upstreamProvider ? { upstreamProvider } : {}),
      } satisfies ModelResponse;
    },
  };
}

export function openRouterApiKey(env: Record<string, string | undefined>): string | undefined {
  const key = env.OPENROUTER_API_KEY?.trim();
  return key || undefined;
}

export function openRouterModel(requested: string | undefined, env: Record<string, string | undefined>): string {
  const configured = requested?.trim() || env.OPENROUTER_MODEL?.trim() || OPENROUTER_PINNED_MODEL;
  if (isUnpinnedAlias(configured)) return OPENROUTER_PINNED_MODEL;
  return configured;
}

function isUnpinnedAlias(model: string): boolean {
  return /(^|[/:])(latest|free|nitro|floor)($|[:/])/i.test(model);
}

function toOpenRouterMessages(messages: ModelMessage[]): Array<{ role: ModelMessage["role"]; content: string }> {
  return messages.map((message) => ({ role: message.role, content: message.content }));
}

function messageText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object" || !("text" in part)) return "";
      return typeof part.text === "string" ? part.text : "";
    })
    .join("")
    .trim();
}

function readUsage(value: unknown): ModelUsage | undefined {
  if (!value || typeof value !== "object") return undefined;
  const usage = value as Record<string, unknown>;
  const inputTokens = finiteCount(usage.prompt_tokens);
  const outputTokens = finiteCount(usage.completion_tokens);
  const cost = typeof usage.cost === "number" && Number.isFinite(usage.cost) ? usage.cost : undefined;
  if (inputTokens === undefined && outputTokens === undefined && cost === undefined) return undefined;
  return {
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(cost !== undefined ? { cost } : {}),
  };
}

function finiteCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  return Math.round(value);
}

function safeUpstream(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const name = value.trim();
  if (!name || name.length > 80) return undefined;
  if (!/^[A-Za-z0-9][A-Za-z0-9 ._+-]{0,79}$/.test(name)) return undefined;
  return name;
}

function statusCode(status: number): "not_configured" | "rate_limited" | "timeout" | "provider_error" {
  if (status === 401 || status === 403) return "not_configured";
  if (status === 429) return "rate_limited";
  if (status === 408 || status === 504) return "timeout";
  return "provider_error";
}

async function providerFetch(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
  parent?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ProviderCallError("openrouter", "timeout"));
    }, timeoutMs);
  });
  const onParent = () => controller.abort();
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", onParent, { once: true });
  }
  try {
    return await Promise.race([fetchImpl(url, { ...init, signal: controller.signal }), timedOut]);
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "AbortError" || name === "TimeoutError") {
      throw new ProviderCallError("openrouter", "timeout");
    }
    throw new ProviderCallError("openrouter", "network");
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onParent);
  }
}
