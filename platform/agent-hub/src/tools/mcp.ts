import type { Tool, ToolContext, ToolResult } from "./types";

/**
 * MCP stays behind the agent. This adapter is the only bridge from an MCP
 * client into the tool registry. It is not mounted on an HTTP route.
 */
export interface McpToolClient {
  call(name: string, input: unknown, context: ToolContext): Promise<unknown>;
}

export function toolFromMcp(client: McpToolClient, name: string, description: string): Tool {
  return {
    name,
    description,
    async execute(input: unknown, context: ToolContext): Promise<ToolResult> {
      try {
        const output = await client.call(name, input, context);
        return { ok: true, output };
      } catch {
        return { ok: false, output: null, errorCode: "TOOL_FAILED" };
      }
    },
  };
}
