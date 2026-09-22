import type { Logger } from "../log";
import { createLocalProvider, createOpenaiProvider } from "./disabled";
import { ProviderCallError, type ProviderCallCode } from "./errors";
import { createGeminiProvider, type GeminiProviderOptions } from "./gemini";
import { createMockProvider } from "./mock";
import { createOpenRouterProvider, type OpenRouterProviderOptions } from "./openrouter";
import type { ModelProvider, ModelProviderId, ModelRequest, ModelResponse, ModelRouter } from "./types";

const FALLBACK_CODES = new Set<ProviderCallCode>(["rate_limited", "timeout", "network", "provider_error"]);

export interface ModelRouterOptions {
  log?: Logger;
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function isFallbackEligible(error: unknown): error is ProviderCallError {
  return error instanceof ProviderCallError && FALLBACK_CODES.has(error.code);
}

export function createModelRouter(
  providers: { [K in ModelProviderId]: ModelProvider },
  options: { log?: Logger } = {},
): ModelRouter {
  return {
    async complete(request) {
      try {
        return await runProvider(providers, options.log, request, request.provider, request.model, false);
      } catch (error) {
        const fallback = request.fallback;
        if (!fallback || !isFallbackEligible(error)) throw error;
        return runProvider(providers, options.log, request, fallback.provider, fallback.model, true);
      }
    },
  };
}

export function createDefaultModelRouter(options: ModelRouterOptions = {}): ModelRouter {
  const providerOptions: GeminiProviderOptions & OpenRouterProviderOptions = {
    ...(options.env ? { env: options.env } : {}),
    ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
    ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
  };
  return createModelRouter(
    {
      mock: createMockProvider(),
      local: createLocalProvider(),
      gemini: createGeminiProvider(providerOptions),
      openai: createOpenaiProvider(),
      openrouter: createOpenRouterProvider(providerOptions),
    },
    { ...(options.log ? { log: options.log } : {}) },
  );
}

async function runProvider(
  providers: { [K in ModelProviderId]: ModelProvider },
  log: Logger | undefined,
  request: ModelRequest,
  providerId: ModelProviderId,
  model: string | undefined,
  fallbackUsed: boolean,
): Promise<ModelResponse> {
  const started = performance.now();
  const provider = providers[providerId];
  try {
    const result = await provider.complete({
      ...request,
      provider: providerId,
      ...(model ? { model } : {}),
      fallback: undefined,
    });
    const response: ModelResponse = {
      ...result,
      provider: result.provider,
      model: result.model,
      fallbackUsed,
      durationMs: elapsed(started),
    };
    logCall(log, request, response, "ok");
    return response;
  } catch (error) {
    logCall(log, request, {
      provider: providerId,
      model: model ?? "",
      fallbackUsed,
      durationMs: elapsed(started),
      text: "",
    }, outcomeFor(error));
    throw error;
  }
}

function logCall(log: Logger | undefined, request: ModelRequest, response: ModelResponse, outcome: string): void {
  log?.log({
    level: outcome === "ok" ? "info" : "warn",
    message: "model",
    ...(request.call?.requestId ? { requestId: request.call.requestId } : {}),
    ...(request.call?.agentId ? { agentId: request.call.agentId } : {}),
    provider: response.provider,
    model: response.model,
    outcome,
    durationMs: response.durationMs,
    fallbackUsed: response.fallbackUsed === true,
    ...(response.usage?.inputTokens !== undefined ? { inputTokens: response.usage.inputTokens } : {}),
    ...(response.usage?.outputTokens !== undefined ? { outputTokens: response.usage.outputTokens } : {}),
    ...(response.upstreamProvider ? { upstreamProvider: response.upstreamProvider } : {}),
    ...(outcome !== "ok" ? { errorCode: outcome } : {}),
  });
}

function outcomeFor(error: unknown): string {
  if (error instanceof ProviderCallError) return error.code;
  return "provider_error";
}

function elapsed(started: number): number {
  return Math.max(0, Math.round(performance.now() - started));
}
