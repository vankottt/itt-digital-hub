import type { Tool, ToolRegistry } from "./types";

export function createToolRegistry(tools: readonly Tool[] = []): ToolRegistry {
  const byName = new Map<string, Tool>();
  for (const tool of tools) {
    add(byName, tool);
  }
  return {
    get(name) {
      return byName.get(name);
    },
    list() {
      return [...byName.values()].map((tool) => ({ name: tool.name, description: tool.description }));
    },
    register(tool) {
      add(byName, tool);
    },
  };
}

function add(byName: Map<string, Tool>, tool: Tool): void {
  if (!/^[a-z][a-z0-9._-]{0,63}$/.test(tool.name)) {
    throw new Error("Invalid tool name");
  }
  if (byName.has(tool.name)) throw new Error("Duplicate tool name");
  byName.set(tool.name, tool);
}
