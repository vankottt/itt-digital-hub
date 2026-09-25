import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AgentHandledError,
  type Agent,
  type AgentContext,
  type AgentResponse,
} from "../../src/agent";
import { parseManifest } from "../../src/manifest";
import { ProviderCallError, ProviderNotEnabledError } from "../../src/providers/errors";
import { GEMINI_DEFAULT_MODEL } from "../../src/providers/gemini";
import { OPENROUTER_PINNED_MODEL, openRouterModel } from "../../src/providers/openrouter";
import type { ModelRequest } from "../../src/providers/types";
import { refusalFor, systemPrompt } from "./prompt";
import { retrieveVikContext, type RetrievalResult } from "./retrieval";

const manifest = parseManifest(
  JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "manifest.json"), "utf8")),
);

export function createVikDesignerAgent(): Agent {
  return {
    manifest,
    async handle(request, context): Promise<AgentResponse> {
      const priorUserText = [...request.history].reverse().find((turn) => turn.role === "user")?.content ?? "";
      const retrieved = retrieveVikContext(request.message, priorUserText);
      logRetrieval(context, retrieved);
      if (!retrieved.confident) return { answer: refusalFor(request.locale) };
      try {
        const result = await context.models.complete({
          ...modelCall(process.env),
          call: { requestId: context.requestId, agentId: manifest.id },
          messages: [
            { role: "system", content: systemPrompt(request.locale, retrieved) },
            ...request.history,
            { role: "user", content: request.message },
          ],
          signal: context.signal,
        });
        return { answer: result.text };
      } catch (error) {
        mapProvider(error);
      }
    },
  };
}

export const vikDesignerAgent: Agent = createVikDesignerAgent();

function modelCall(env: NodeJS.ProcessEnv): Pick<ModelRequest, "provider" | "model" | "fallback"> {
  const policy = manifest.modelPolicy;
  const provider = policy?.provider ?? "openrouter";
  const model =
    provider === "openrouter"
      ? openRouterModel(env.OPENROUTER_MODEL?.trim() || policy?.model || OPENROUTER_PINNED_MODEL, env)
      : env.AI_MODEL?.trim() || policy?.model || GEMINI_DEFAULT_MODEL;
  const fallbackPolicy = policy?.fallback;
  return {
    provider,
    model,
    fallback: fallbackPolicy
      ? {
          provider: fallbackPolicy.provider,
          model:
            fallbackPolicy.provider === "gemini"
              ? env.AI_MODEL?.trim() || fallbackPolicy.model || GEMINI_DEFAULT_MODEL
              : fallbackPolicy.model,
        }
      : undefined,
  };
}

function mapProvider(error: unknown): never {
  if (error instanceof ProviderCallError) {
    if (error.code === "rate_limited") throw new AgentHandledError("RATE_LIMITED", error.status);
    if (error.code === "timeout") throw new AgentHandledError("PROVIDER_TIMEOUT", error.status);
    if (error.code === "not_configured") throw new AgentHandledError("NOT_CONFIGURED", error.status);
    throw new AgentHandledError("PROVIDER_UNAVAILABLE", error.status);
  }
  if (error instanceof ProviderNotEnabledError) throw new AgentHandledError("NOT_CONFIGURED");
  throw error;
}

function logRetrieval(context: AgentContext, retrieved: RetrievalResult): void {
  if (process.env.NODE_ENV === "production") return;
  console.info(
    JSON.stringify({
      service: "itt-agent-hub",
      message: "retrieval",
      requestId: context.requestId,
      agentId: manifest.id,
      documents: [...new Set(retrieved.chunks.map((item) => item.chunk.documentId))],
      articles: retrieved.chunks.map((item) => item.chunk.article),
      scores: retrieved.chunks.map((item) => item.score),
      selectedChars: retrieved.selectedChars,
      limitationHits: retrieved.limitationHits,
      buildMs: retrieved.buildMs,
      retrieveMs: retrieved.retrieveMs,
    }),
  );
}
