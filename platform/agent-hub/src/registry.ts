import { aiActAgent } from "../agents/ai-act/handler";
import { exampleAgent } from "../agents/example/handler";
import { mockAgent } from "../agents/mock/handler";
import { vikDesignerAgent } from "../agents/vik-designer/handler";
import type { Agent } from "./agent";

export interface AgentRegistry {
  get(id: string): Agent | undefined;
}

export function createAgentRegistry(
  agents: readonly Agent[] = [mockAgent, exampleAgent, aiActAgent, vikDesignerAgent],
): AgentRegistry {
  const byId = new Map<string, Agent>();
  for (const agent of agents) {
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(agent.manifest.id) || byId.has(agent.manifest.id)) {
      throw new Error("Invalid agent registry");
    }
    byId.set(agent.manifest.id, agent);
  }
  return {
    get(id) {
      return byId.get(id);
    },
  };
}
