import { getCorpus } from "../engine/corpus";
import { callTool, toolDefinitions } from "../engine/tools";

const PROTOCOL = "2025-06-18";
const MAX_BODY_BYTES = 256 * 1024;

export type McpHealth = {
  status: "ok";
  service: "ai-act-assistant-mcp";
  protocol: string;
  documents: number;
  chunks: number;
  tools: string[];
};

export function mcpHealth(): McpHealth {
  const corpus = getCorpus();
  return {
    status: "ok",
    service: "ai-act-assistant-mcp",
    protocol: PROTOCOL,
    documents: corpus.documents.length,
    chunks: corpus.chunks.length,
    tools: toolDefinitions.map((tool) => tool.name),
  };
}

export async function handleMcpHttp(request: Request): Promise<Response> {
  if (request.method === "GET" || request.method === "DELETE") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { Allow: "POST", "content-type": "application/json" },
    });
  }
  if (request.method !== "POST") {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request." } }, 400);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Request is too large." } }, 413);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error." } }, 400);
  }
  if (Array.isArray(payload)) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Batch requests are not supported." } }, 400);
  }
  if (!isRecord(payload) || payload.jsonrpc !== "2.0" || typeof payload.method !== "string") {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request." } }, 400);
  }

  const id = "id" in payload ? payload.id : undefined;
  if (id === undefined) return new Response(null, { status: 202 });

  try {
    const result = dispatch(payload.method, payload.params);
    return json({ jsonrpc: "2.0", id, result }, 200, request.headers.get("accept"));
  } catch (error) {
    const message = error instanceof McpError ? error.message : "Request failed.";
    const code = error instanceof McpError ? error.rpcCode : -32603;
    return json({ jsonrpc: "2.0", id, error: { code, message } }, 200, request.headers.get("accept"));
  }
}

function dispatch(method: string, params: unknown): unknown {
  if (method === "initialize") {
    return {
      protocolVersion: PROTOCOL,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "ai-act-assistant", version: "1.0.0" },
    };
  }
  if (method === "ping") return {};
  if (method === "tools/list") {
    return {
      tools: toolDefinitions.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  }
  if (method === "tools/call") return callMcpTool(params);
  throw new McpError(-32601, "Method not found.");
}

function callMcpTool(params: unknown): unknown {
  if (!isRecord(params) || typeof params.name !== "string") throw new McpError(-32602, "Tool name is required.");
  const args = "arguments" in params ? params.arguments : {};
  if (args !== undefined && !isRecord(args)) throw new McpError(-32602, "Tool arguments must be an object.");
  const result = callTool(params.name, args ?? {});
  if (!result.ok) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: { code: result.code, message: result.message } }) }],
      isError: true,
    };
  }
  return { content: [{ type: "text", text: JSON.stringify(result.data) }], isError: false };
}

function json(body: unknown, status: number, accept?: string | null): Response {
  const encoded = JSON.stringify(body);
  if (accept?.includes("text/event-stream") && !accept.includes("application/json")) {
    return new Response(`event: message\ndata: ${encoded}\n\n`, {
      status,
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
    });
  }
  return new Response(encoded, { status, headers: { "content-type": "application/json" } });
}

class McpError extends Error {
  constructor(
    readonly rpcCode: number,
    message: string,
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
