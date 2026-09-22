import type { ClientState } from "../../../shared/src/index";
import {
  AgentHandledError,
  type Agent,
  type AgentActionRequest,
  type AgentActionResponse,
  type AgentContext,
  type AgentRequest,
  type AgentResponse,
} from "../../src/agent";
import { readManifest } from "../../src/manifest";
import { ProviderCallError, ProviderNotEnabledError } from "../../src/providers/errors";
import { GEMINI_DEFAULT_MODEL } from "../../src/providers/gemini";
import { OPENROUTER_PINNED_MODEL, openRouterModel } from "../../src/providers/openrouter";
import type { ModelRequest } from "../../src/providers/types";
import {
  attachLead,
  createGateState,
  decodeGateState,
  encodeGateState,
  gateAllowsChat,
  incrementAnonymousCount,
  type GateState,
} from "../../../../src/lib/ai-act/gate-token";
import { loadKnowledgeContext, loadSystemInstructions } from "../../../../src/lib/ai-act/knowledge";
import { parseLeadPayload } from "../../../../src/lib/ai-act/lead";
import { notifyLead } from "../../../../src/lib/ai-act/lead-notify";
import type { AiActLeadInput, StoredAiActLead } from "../../../../src/lib/ai-act/types";
import { persistAiActLead } from "./store";

const manifest = readManifest(new URL("./manifest.json", import.meta.url));
const ANONYMOUS_QUESTION_LIMIT = 2;
const systemCache = new Map<string, string>();

export interface AiActAgentDeps {
  env?: NodeJS.ProcessEnv;
  persist?: (input: AiActLeadInput) => Promise<StoredAiActLead>;
  notify?: (lead: StoredAiActLead) => Promise<void>;
}

export function createAiActAgent(deps: AiActAgentDeps = {}): Agent {
  const env = deps.env ?? process.env;
  const persist = deps.persist ?? ((input: AiActLeadInput) => persistAiActLead(input, env));
  const notify = deps.notify ?? notifyLead;

  return {
    manifest,
    async handle(request, context): Promise<AgentResponse> {
      const secret = requireGateSecret(env);
      const gate = loadGate(request.clientState, request.sessionId, secret);
      if (!gateAllowsChat(gate)) throw new AgentHandledError("LEAD_REQUIRED");

      const answer = await complete(request, context, env);
      const next = incrementAnonymousCount(gate);
      return { answer, state: publicState(next, encodeGateState(next, secret)) };
    },
    async act(actionId, request): Promise<AgentActionResponse> {
      if (actionId === "authorize") return authorize(request, env);
      if (actionId === "lead") return submitLead(request, env, persist, notify);
      throw new AgentHandledError("NOT_FOUND");
    },
  };
}

export const aiActAgent: Agent = createAiActAgent();

async function complete(request: AgentRequest, context: AgentContext, env: NodeJS.ProcessEnv): Promise<string> {
  try {
    const policy = modelCall(env);
    const result = await context.models.complete({
      ...policy,
      call: { requestId: context.requestId, agentId: manifest.id },
      messages: [
        { role: "system", content: systemFor(request.locale) },
        ...request.history,
        { role: "user", content: request.message },
      ],
      signal: context.signal,
    });
    return result.text;
  } catch (error) {
    mapProvider(error);
  }
}

function requireGateSecret(env: NodeJS.ProcessEnv): string {
  const dedicated = env.AI_ACT_GATE_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;
  const hub = env.ITT_HUB_SHARED_SECRET?.trim();
  if (hub && hub.length >= 16) return `ai-act-gate:${hub}`;
  throw new AgentHandledError("NOT_CONFIGURED");
}

function loadGate(clientState: ClientState | undefined, sessionId: string, secret: string): GateState {
  const token = typeof clientState?.gate === "string" ? clientState.gate : undefined;
  return decodeGateState(token, secret) ?? createGateState(sessionId);
}

function publicState(state: GateState, gate: string): ClientState {
  const leadCaptured = Boolean(state.lead);
  const questionsAsked = state.q;
  return {
    gate,
    questionsAsked,
    questionsRemaining: leadCaptured ? 0 : Math.max(0, ANONYMOUS_QUESTION_LIMIT - questionsAsked),
    leadCaptured,
    leadRequired: !leadCaptured && questionsAsked >= ANONYMOUS_QUESTION_LIMIT,
  };
}

function systemFor(locale: AgentRequest["locale"]): string {
  const cached = systemCache.get(locale);
  if (cached) return cached;
  const knowledge = loadKnowledgeContext(locale);
  const system = [loadSystemInstructions(locale), knowledge.systemSupplement].filter(Boolean).join("\n\n");
  systemCache.set(locale, system);
  return system;
}

function modelCall(env: NodeJS.ProcessEnv): Pick<ModelRequest, "provider" | "model" | "fallback"> {
  const policy = manifest.modelPolicy;
  const provider = policy?.provider ?? "openrouter";
  const model =
    provider === "openrouter"
      ? openRouterModel(env.OPENROUTER_MODEL?.trim() || policy?.model || OPENROUTER_PINNED_MODEL, env)
      : env.AI_MODEL?.trim() || policy?.model || GEMINI_DEFAULT_MODEL;
  const fallbackPolicy = policy?.fallback;
  const fallback = fallbackPolicy
    ? {
        provider: fallbackPolicy.provider,
        model:
          fallbackPolicy.provider === "gemini"
            ? env.AI_MODEL?.trim() || fallbackPolicy.model || GEMINI_DEFAULT_MODEL
            : fallbackPolicy.model,
      }
    : { provider: "gemini" as const, model: env.AI_MODEL?.trim() || GEMINI_DEFAULT_MODEL };
  return { provider, model, fallback };
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

function authorize(request: AgentActionRequest, env: NodeJS.ProcessEnv): AgentActionResponse {
  const secret = requireGateSecret(env);
  const token = request.clientState?.gate;
  const gate = typeof token === "string" ? decodeGateState(token, secret) : null;
  if (!gate?.lead) throw new AgentHandledError("LEAD_REQUIRED");
  return { result: { allowed: true } };
}

async function submitLead(
  request: AgentActionRequest,
  env: NodeJS.ProcessEnv,
  persist: (input: AiActLeadInput) => Promise<StoredAiActLead>,
  notify: (lead: StoredAiActLead) => Promise<void>,
): Promise<AgentActionResponse> {
  const parsed = parseLeadPayload(request.input);
  if (parsed.kind === "spam") return { result: { persisted: true } };
  if (parsed.kind === "invalid") throw new AgentHandledError("INVALID_BODY");

  let stored: StoredAiActLead;
  try {
    stored = await persist(parsed.data);
  } catch {
    throw new AgentHandledError("PROVIDER_UNAVAILABLE");
  }
  try {
    await notify(stored);
  } catch {
    console.error("[ai-act] lead notify failed");
  }

  const secret = requireGateSecret(env);
  const gate = loadGate(request.clientState, parsed.data.anonymousSessionId, secret);
  const next = attachLead(gate, {
    id: stored.id,
    name: stored.name,
    workEmail: stored.workEmail,
    company: stored.company,
    role: stored.role,
    marketingConsent: stored.marketingConsent,
  });
  return { result: { persisted: true }, state: publicState(next, encodeGateState(next, secret)) };
}
