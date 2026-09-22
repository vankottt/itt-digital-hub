export interface ToolContext {
  requestId: string;
  agentId: string;
  signal: AbortSignal;
}

export interface ToolResult {
  ok: boolean;
  output: unknown;
  errorCode?: string;
}

export interface Tool {
  name: string;
  description: string;
  execute(input: unknown, context: ToolContext): Promise<ToolResult>;
}

export interface ToolRegistry {
  get(name: string): Tool | undefined;
  list(): Array<{ name: string; description: string }>;
  register(tool: Tool): void;
}
