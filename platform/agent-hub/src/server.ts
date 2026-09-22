import { once } from "node:events";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  DEFAULT_HUB_HOST,
  DEFAULT_HUB_PORT,
  DEFAULT_UPSTREAM_TIMEOUT_MS,
  HEADER_REQUEST_ID,
  HEADER_SIGNATURE,
  HEADER_TIMESTAMP,
  MAX_ANSWER_CHARS,
  MAX_BODY_BYTES,
  decodeJson,
  errorResponse,
  isJsonContentType,
  isRequestId,
  jsonResponse,
  matchActionPath,
  matchChatPath,
  parseActionPayload,
  parseChatPayload,
  publicMessage,
  readBodyWithLimit,
  requestTimeout,
  verifySignature,
  type ClientState,
  type ErrorCode,
} from "../../shared/src/index";
import { AgentHandledError, type AgentContext } from "./agent";
import { dispatchAgent } from "./dispatch";
import { knowledgeDirectory } from "./knowledge";
import { createLogger, safeErrorName, type Logger } from "./log";
import { createDefaultModelRouter } from "./providers/router";
import type { ModelRouter } from "./providers/types";
import { createAgentRegistry, type AgentRegistry } from "./registry";
import { createToolRegistry } from "./tools/registry";
import type { ToolRegistry } from "./tools/types";

const BLOCKED_PATHS = new Set(["/mcp", "/tools/list", "/resources/list", "/prompts/list"]);
const HOP_BY_HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "host", "content-length"]);

export interface HubRuntime {
  secret: string;
  registry: AgentRegistry;
  models: ModelRouter;
  tools: ToolRegistry;
  now: () => Date;
  log: Logger;
}

interface RouteResult {
  response: Response;
  errorCode?: ErrorCode;
  errorName?: string;
  providerStatus?: number;
  requestId: string;
  agentId?: string;
}

export function createHubRuntime(options: Partial<HubRuntime> & { secret: string }): HubRuntime {
  const log = options.log ?? createLogger({ level: "info" });
  return {
    secret: options.secret,
    registry: options.registry ?? createAgentRegistry(),
    models: options.models ?? createDefaultModelRouter({ log }),
    tools: options.tools ?? createToolRegistry(),
    now: options.now ?? (() => new Date()),
    log,
  };
}

export async function handleHubRequest(request: Request, runtime: HubRuntime): Promise<Response> {
  const started = performance.now();
  const url = new URL(request.url);
  const action = matchActionPath(url.pathname);
  const agentId = matchChatPath(url.pathname) ?? action?.agentId;
  let result: RouteResult;
  try {
    result = await routeHub(request, url, runtime, agentId, action?.actionId);
  } catch (error) {
    const requestId = crypto.randomUUID();
    result = {
      response: errorResponse("INTERNAL", requestId),
      errorCode: "INTERNAL",
      errorName: safeErrorName(error),
      requestId,
      ...(agentId ? { agentId } : {}),
    };
  }

  runtime.log.log({
    level: result.response.status >= 500 ? "error" : result.response.status >= 400 ? "warn" : "info",
    message: "request",
    requestId: result.requestId,
    ...(result.agentId ? { agentId: result.agentId } : {}),
    status: result.response.status,
    durationMs: elapsed(started),
    ...(result.errorCode ? { errorCode: result.errorCode } : {}),
    ...(result.errorName ? { errorName: result.errorName } : {}),
    ...(result.providerStatus ? { providerStatus: result.providerStatus } : {}),
  });
  return result.response;
}

export function startAgentHub(
  options: Partial<HubRuntime> & { secret: string; host?: string; port?: number },
): Promise<{ origin: string; close: () => Promise<void> }> {
  const runtime = createHubRuntime(options);
  const host = options.host ?? DEFAULT_HUB_HOST;
  const port = options.port ?? DEFAULT_HUB_PORT;
  const server = createServer((req, res) => {
    void serveNodeRequest(req, res, runtime).catch((error) => {
      const requestId = crypto.randomUUID();
      runtime.log.log({
        level: "error",
        message: "request failed",
        requestId,
        status: 500,
        errorCode: "INTERNAL",
        errorName: safeErrorName(error),
      });
      if (res.headersSent) {
        res.destroy();
        return;
      }
      res.writeHead(500, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        [HEADER_REQUEST_ID]: requestId,
      });
      res.end(JSON.stringify({ error: { code: "INTERNAL", message: publicMessage("INTERNAL"), requestId } }));
    });
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;

  return new Promise((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    server.once("error", onError);
    server.listen(port, host, () => {
      server.off("error", onError);
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error("Hub did not bind to a TCP port"));
        return;
      }
      resolve({
        origin: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((done, fail) => {
            server.close((error) => (error ? fail(error) : done()));
          }),
      });
    });
  });
}

async function routeHub(
  request: Request,
  url: URL,
  runtime: HubRuntime,
  agentId: string | undefined,
  actionId: string | undefined,
): Promise<RouteResult> {
  const ids = requestIds(request);

  if (BLOCKED_PATHS.has(url.pathname)) {
    return done(errorResponse("NOT_FOUND", ids.responseId), ids.responseId, "NOT_FOUND", agentId);
  }

  if (url.pathname === "/health") {
    if (request.method !== "GET") {
      return done(methodNotAllowed("GET", ids.responseId), ids.responseId, "METHOD_NOT_ALLOWED");
    }
    return done(jsonResponse({ status: "ok", service: "itt-agent-hub" }, 200, ids.responseId), ids.responseId);
  }

  if (!agentId || url.search) {
    return done(errorResponse("NOT_FOUND", ids.responseId), ids.responseId, "NOT_FOUND");
  }

  if (request.method !== "POST") {
    return done(methodNotAllowed("POST", ids.responseId), ids.responseId, "METHOD_NOT_ALLOWED", agentId);
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return done(errorResponse("INVALID_CONTENT_TYPE", ids.responseId), ids.responseId, "INVALID_CONTENT_TYPE", agentId);
  }

  const body = await readBodyWithLimit(request, MAX_BODY_BYTES);
  if (!body.ok) {
    const code = body.reason === "too_large" ? "BODY_TOO_LARGE" : "INTERNAL";
    return done(errorResponse(code, ids.responseId), ids.responseId, code, agentId);
  }

  const verdict = await verifySignature({
    secret: runtime.secret,
    timestamp: request.headers.get(HEADER_TIMESTAMP) ?? "",
    method: "POST",
    path: url.pathname,
    requestId: ids.header ?? "",
    body: body.bytes,
    signature: request.headers.get(HEADER_SIGNATURE) ?? "",
    nowSeconds: Math.floor(runtime.now().getTime() / 1000),
  });
  if (verdict === "expired") {
    return done(errorResponse("SIGNATURE_EXPIRED", ids.responseId), ids.responseId, "SIGNATURE_EXPIRED", agentId);
  }
  if (verdict !== "ok") {
    return done(errorResponse("INVALID_SIGNATURE", ids.responseId), ids.responseId, "INVALID_SIGNATURE", agentId);
  }

  const decoded = decodeJson(body.bytes);
  if (!decoded.ok) {
    return done(errorResponse("INVALID_JSON", ids.responseId), ids.responseId, "INVALID_JSON", agentId);
  }
  if (actionId && agentId) {
    return handleAction(decoded.value, runtime, ids.responseId, agentId, actionId);
  }
  const parsed = parseChatPayload(decoded.value);
  if (!parsed.ok) {
    return done(errorResponse(parsed.code, ids.responseId), ids.responseId, parsed.code, agentId);
  }

  const sessionId = parsed.value.sessionId ?? crypto.randomUUID();
  const agent = runtime.registry.get(agentId);
  const knowledgeDir = agent?.manifest.knowledge
    ? knowledgeDirectory(agent.manifest.id, agent.manifest.knowledge.directory)
    : null;
  const timeout = requestTimeout(DEFAULT_UPSTREAM_TIMEOUT_MS);
  const context: AgentContext = {
    requestId: ids.responseId,
    signal: timeout.signal,
    models: runtime.models,
    tools: runtime.tools,
    knowledgeDir,
    now: runtime.now,
  };

  try {
    const dispatched = await dispatchAgent(
      runtime.registry,
      agentId,
      { ...parsed.value, sessionId },
      context,
    );
    if (!dispatched.ok) {
      return done(errorResponse(dispatched.code, ids.responseId), ids.responseId, dispatched.code, agentId);
    }
    const state = sanitizeState(dispatched.response.state);
    if (dispatched.response.state && !state) {
      return done(errorResponse("INTERNAL", ids.responseId), ids.responseId, "INTERNAL", agentId);
    }
    if (!isSafeAnswer(dispatched.response.answer)) {
      return done(errorResponse("INTERNAL", ids.responseId), ids.responseId, "INTERNAL", agentId);
    }
    return done(
      jsonResponse(
        {
          requestId: ids.responseId,
          agentId,
          sessionId,
          answer: dispatched.response.answer,
          ...(state ? { state } : {}),
        },
        200,
        ids.responseId,
      ),
      ids.responseId,
      undefined,
      agentId,
    );
  } catch (error) {
    if (error instanceof AgentHandledError) {
      return done(errorResponse(error.code, ids.responseId), ids.responseId, error.code, agentId, undefined, error.providerStatus);
    }
    return done(errorResponse("INTERNAL", ids.responseId), ids.responseId, "INTERNAL", agentId, safeErrorName(error));
  } finally {
    timeout.cancel();
  }
}

async function handleAction(
  payload: unknown,
  runtime: HubRuntime,
  requestId: string,
  agentId: string,
  actionId: string,
): Promise<RouteResult> {
  const parsed = parseActionPayload(payload);
  if (!parsed.ok) return done(errorResponse(parsed.code, requestId), requestId, parsed.code, agentId);

  const agent = runtime.registry.get(agentId);
  const knowledgeDir = agent?.manifest.knowledge
    ? knowledgeDirectory(agent.manifest.id, agent.manifest.knowledge.directory)
    : null;
  const timeout = requestTimeout(DEFAULT_UPSTREAM_TIMEOUT_MS);
  const context: AgentContext = {
    requestId,
    signal: timeout.signal,
    models: runtime.models,
    tools: runtime.tools,
    knowledgeDir,
    now: runtime.now,
  };

  try {
    if (!agent || agent.manifest.visibility !== "public" || !agent.act) {
      return done(errorResponse("AGENT_NOT_FOUND", requestId), requestId, "AGENT_NOT_FOUND", agentId);
    }
    if (!agent.manifest.enabled) {
      return done(errorResponse("AGENT_DISABLED", requestId), requestId, "AGENT_DISABLED", agentId);
    }
    if (!agent.manifest.locales.includes(parsed.value.locale)) {
      return done(errorResponse("INVALID_BODY", requestId), requestId, "INVALID_BODY", agentId);
    }
    const action = await agent.act(actionId, { ...parsed.value, actionId }, context);
    const result = sanitizeState(action.result);
    const state = sanitizeState(action.state);
    if (!result || (action.state && !state)) {
      return done(errorResponse("INTERNAL", requestId), requestId, "INTERNAL", agentId);
    }
    return done(
      jsonResponse(
        {
          requestId,
          agentId,
          actionId,
          result,
          ...(state ? { state } : {}),
        },
        200,
        requestId,
      ),
      requestId,
      undefined,
      agentId,
    );
  } catch (error) {
    if (error instanceof AgentHandledError) {
      return done(errorResponse(error.code, requestId), requestId, error.code, agentId, undefined, error.providerStatus);
    }
    return done(errorResponse("INTERNAL", requestId), requestId, "INTERNAL", agentId, safeErrorName(error));
  } finally {
    timeout.cancel();
  }
}

function sanitizeState(state: ClientState | undefined): ClientState | undefined {
  if (!state) return undefined;
  const output: ClientState = {};
  for (const [key, value] of Object.entries(state)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(key)) return undefined;
    if (typeof value === "string" && value.length <= 4_000) output[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) output[key] = value;
    else if (typeof value === "boolean") output[key] = value;
    else return undefined;
  }
  if (JSON.stringify(output).length > 8_192) return undefined;
  return output;
}

function done(
  response: Response,
  requestId: string,
  errorCode?: ErrorCode,
  agentId?: string,
  errorName?: string,
  providerStatus?: number,
): RouteResult {
  return {
    response,
    requestId,
    ...(errorCode ? { errorCode } : {}),
    ...(agentId ? { agentId } : {}),
    ...(errorName ? { errorName } : {}),
    ...(providerStatus ? { providerStatus } : {}),
  };
}

function requestIds(request: Request): { header: string | null; responseId: string } {
  const header = request.headers.get(HEADER_REQUEST_ID);
  if (header && isRequestId(header)) {
    const normalized = header.toLowerCase();
    return { header: normalized, responseId: normalized };
  }
  return { header, responseId: crypto.randomUUID() };
}

function methodNotAllowed(allow: string, requestId: string): Response {
  const headers = new Headers();
  headers.set("allow", allow);
  return errorResponse("METHOD_NOT_ALLOWED", requestId, headers);
}

function isSafeAnswer(answer: unknown): answer is string {
  return typeof answer === "string" && answer.trim().length > 0 && answer.length <= MAX_ANSWER_CHARS;
}

function elapsed(started: number): number {
  return Math.max(0, Math.round(performance.now() - started));
}

async function serveNodeRequest(req: IncomingMessage, res: ServerResponse, runtime: HubRuntime): Promise<void> {
  const declared = req.headers["content-length"];
  if (typeof declared === "string" && /^\d+$/.test(declared) && Number(declared) > MAX_BODY_BYTES) {
    const requestId = crypto.randomUUID();
    res.writeHead(413, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      [HEADER_REQUEST_ID]: requestId,
    });
    res.end(JSON.stringify({ error: { code: "BODY_TOO_LARGE", message: publicMessage("BODY_TOO_LARGE"), requestId } }));
    return;
  }

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      req.destroy();
      const requestId = crypto.randomUUID();
      if (!res.headersSent) {
        res.writeHead(413, { "content-type": "application/json; charset=utf-8", [HEADER_REQUEST_ID]: requestId });
        res.end(JSON.stringify({ error: { code: "BODY_TOO_LARGE", message: publicMessage("BODY_TOO_LARGE"), requestId } }));
      }
      return;
    }
    chunks.push(buffer);
  }

  const bytes = new Uint8Array(Buffer.concat(chunks));
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || HOP_BY_HOP.has(key.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const request = new Request(url, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : bytes,
  });
  const response = await handleHubRequest(request, runtime);
  await writeWebResponse(res, response);
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (!response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    if (!res.write(Buffer.from(value))) await once(res, "drain");
  }
  res.end();
}
