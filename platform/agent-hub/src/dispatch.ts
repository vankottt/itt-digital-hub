import type { AgentContext, AgentRequest, AgentResponse } from "./agent";
import type { AgentRegistry } from "./registry";

export type DispatchFailure = "AGENT_NOT_FOUND" | "AGENT_DISABLED" | "INVALID_BODY" | "MESSAGE_TOO_LONG";

export async function dispatchAgent(
  registry: AgentRegistry,
  agentId: string,
  request: AgentRequest,
  context: AgentContext,
): Promise<{ ok: true; response: AgentResponse } | { ok: false; code: DispatchFailure }> {
  const agent = registry.get(agentId);
  if (!agent || agent.manifest.visibility !== "public") return { ok: false, code: "AGENT_NOT_FOUND" };
  if (!agent.manifest.enabled) return { ok: false, code: "AGENT_DISABLED" };
  if (!agent.manifest.locales.includes(request.locale)) return { ok: false, code: "INVALID_BODY" };
  const limit = agent.manifest.limits?.maxMessageChars;
  if (typeof limit === "number" && request.message.length > limit) return { ok: false, code: "MESSAGE_TOO_LONG" };
  const response = await agent.handle(request, context);
  return { ok: true, response };
}
