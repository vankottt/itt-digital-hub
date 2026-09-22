import {
  HEADER_REQUEST_ID,
  HEADER_SIGNATURE,
  HEADER_TIMESTAMP,
  MAX_BODY_BYTES,
  MAX_UPSTREAM_TIMEOUT_MS,
  MIN_SHARED_SECRET_CHARS,
  MIN_UPSTREAM_TIMEOUT_MS,
  DEFAULT_UPSTREAM_TIMEOUT_MS,
  corsHeaders,
  decodeJson,
  errorResponse,
  isJsonContentType,
  isPlaceholderSecret,
  jsonResponse,
  matchActionPath,
  matchChatPath,
  originDecision,
  parseActionPayload,
  parseAllowedOrigins,
  parseChatPayload,
  parseErrorBody,
  readBodyWithLimit,
  requestTimeout,
  signRequest,
  type ErrorCode,
} from "../../shared/src/index";

export interface GatewayEnv {
  GATEWAY_ENV: string;
  AGENT_HUB_ORIGIN: string;
  AGENT_HUB_SHARED_SECRET: string;
  ALLOWED_ORIGINS: string;
  UPSTREAM_TIMEOUT_MS: string;
}

export interface GatewayLog {
  level: "info" | "warn" | "error";
  message: string;
  requestId: string;
  agentId?: string;
  status: number;
  durationMs: number;
  errorCode?: string;
}

export interface GatewayDeps {
  fetch?: typeof fetch;
  now?: () => number;
  log?: (fields: GatewayLog) => void;
}

const AUTH_ERROR_CODES = new Set<ErrorCode>(["INVALID_SIGNATURE", "SIGNATURE_EXPIRED"]);

export async function handleGateway(request: Request, env: GatewayEnv, deps: GatewayDeps = {}): Promise<Response> {
  const started = performance.now();
  const requestId = crypto.randomUUID();
  const allowed = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  const origin = request.headers.get("origin");
  const decision = originDecision(origin, allowed);
  const cors = corsHeaders(origin, allowed);
  const url = new URL(request.url);
  const action = matchActionPath(url.pathname);
  const agentId = matchChatPath(url.pathname) ?? action?.agentId;
  const log = deps.log ?? defaultLog;

  const finish = (response: Response, errorCode?: ErrorCode) => {
    log({
      level: response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info",
      message: "request",
      requestId,
      ...(agentId ? { agentId } : {}),
      status: response.status,
      durationMs: Math.max(0, Math.round(performance.now() - started)),
      ...(errorCode ? { errorCode } : {}),
    });
    return response;
  };

  if (decision === "rejected") {
    return finish(errorResponse("ORIGIN_NOT_ALLOWED", requestId, cors), "ORIGIN_NOT_ALLOWED");
  }

  if (request.method === "OPTIONS") {
    if (decision !== "allowed") return finish(errorResponse("ORIGIN_NOT_ALLOWED", requestId), "ORIGIN_NOT_ALLOWED");
    return finish(new Response(null, { status: 204, headers: cors }));
  }

  if (url.pathname === "/v1/health" && !url.search) {
    if (request.method !== "GET") return finish(methodNotAllowed("GET", requestId, cors), "METHOD_NOT_ALLOWED");
    return finish(jsonResponse({ status: "ok", service: "itt-agent-gateway" }, 200, requestId, cors));
  }

  if (!agentId || url.search) return finish(errorResponse("NOT_FOUND", requestId, cors), "NOT_FOUND");
  if (request.method !== "POST") return finish(methodNotAllowed("POST", requestId, cors), "METHOD_NOT_ALLOWED");
  if (!gatewayConfigured(env)) return finish(errorResponse("INTERNAL", requestId, cors), "INTERNAL");
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return finish(errorResponse("INVALID_CONTENT_TYPE", requestId, cors), "INVALID_CONTENT_TYPE");
  }

  let bytes: Uint8Array;
  try {
    const body = await readBodyWithLimit(request, MAX_BODY_BYTES);
    if (!body.ok) {
      const code = body.reason === "too_large" ? "BODY_TOO_LARGE" : "INTERNAL";
      return finish(errorResponse(code, requestId, cors), code);
    }
    bytes = body.bytes;
  } catch {
    return finish(errorResponse("INTERNAL", requestId, cors), "INTERNAL");
  }

  const decoded = decodeJson(bytes);
  if (!decoded.ok) return finish(errorResponse("INVALID_JSON", requestId, cors), "INVALID_JSON");
  const parsed = action ? parseActionPayload(decoded.value) : parseChatPayload(decoded.value);
  if (!parsed.ok) return finish(errorResponse(parsed.code, requestId, cors), parsed.code);

  const hubUrl = resolveHubUrl(env.AGENT_HUB_ORIGIN, url.pathname, env.GATEWAY_ENV);
  if (!hubUrl) return finish(errorResponse("INTERNAL", requestId, cors), "INTERNAL");

  const timestamp = String(Math.floor((deps.now ?? Date.now)() / 1000));
  const signature = await signRequest({
    secret: env.AGENT_HUB_SHARED_SECRET,
    timestamp,
    method: "POST",
    path: url.pathname,
    requestId,
    body: bytes,
  });
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set(HEADER_TIMESTAMP, timestamp);
  headers.set(HEADER_SIGNATURE, signature);
  headers.set(HEADER_REQUEST_ID, requestId);

  const timeout = requestTimeout(readTimeoutMs(env.UPSTREAM_TIMEOUT_MS));
  try {
    const upstream = await (deps.fetch ?? fetch)(hubUrl, {
      method: "POST",
      headers,
      body: arrayBufferFrom(bytes),
      redirect: "manual",
      signal: timeout.signal,
    });
    const normalized = await normalizeUpstream(upstream, requestId, cors);
    return finish(normalized.response, normalized.errorCode);
  } catch (error) {
    const code = isTimeoutError(error) ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE";
    return finish(errorResponse(code, requestId, cors), code);
  } finally {
    timeout.cancel();
  }
}

export function resolveHubUrl(origin: string, pathname: string, gatewayEnv: string): string | null {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.username || url.password || url.search || url.hash) return null;
  if (url.pathname !== "/" && url.pathname !== "") return null;
  const https = url.protocol === "https:";
  const http = url.protocol === "http:";
  if (gatewayEnv === "production" && !https) return null;
  if (gatewayEnv !== "production" && !https && !http) return null;
  return `${url.origin}${pathname}`;
}

function gatewayConfigured(env: GatewayEnv): boolean {
  if (env.AGENT_HUB_SHARED_SECRET.trim().length < MIN_SHARED_SECRET_CHARS) return false;
  if (env.GATEWAY_ENV === "production" && isPlaceholderSecret(env.AGENT_HUB_SHARED_SECRET.trim())) return false;
  return resolveHubUrl(env.AGENT_HUB_ORIGIN, "/v1/agents/mock/chat", env.GATEWAY_ENV) !== null;
}

function readTimeoutMs(value: string | undefined): number {
  if (!value || !/^\d+$/.test(value)) return DEFAULT_UPSTREAM_TIMEOUT_MS;
  const parsed = Number(value);
  if (parsed < MIN_UPSTREAM_TIMEOUT_MS) return MIN_UPSTREAM_TIMEOUT_MS;
  if (parsed > MAX_UPSTREAM_TIMEOUT_MS) return MAX_UPSTREAM_TIMEOUT_MS;
  return parsed;
}

async function normalizeUpstream(
  upstream: Response,
  requestId: string,
  cors: Headers,
): Promise<{ response: Response; errorCode?: ErrorCode }> {
  if (upstream.status >= 300 && upstream.status < 400) {
    await upstream.body?.cancel();
    return { response: errorResponse("UPSTREAM_UNAVAILABLE", requestId, cors), errorCode: "UPSTREAM_UNAVAILABLE" };
  }

  if (upstream.ok) {
    const media = upstream.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (media !== "application/json" && media !== "text/event-stream") {
      await upstream.body?.cancel();
      return { response: errorResponse("UPSTREAM_UNAVAILABLE", requestId, cors), errorCode: "UPSTREAM_UNAVAILABLE" };
    }
    const headers = new Headers(cors);
    headers.set("content-type", upstream.headers.get("content-type") ?? "application/json; charset=utf-8");
    headers.set("cache-control", "no-store");
    headers.set("x-content-type-options", "nosniff");
    headers.set(HEADER_REQUEST_ID, requestId);
    return { response: new Response(upstream.body, { status: upstream.status, headers }) };
  }

  const limited = await readBodyWithLimit(upstream, 8_192);
  const decoded = limited.ok ? decodeJson(limited.bytes) : { ok: false as const };
  if (decoded.ok) {
    const parsed = parseErrorBody(decoded.value);
    if (parsed && !AUTH_ERROR_CODES.has(parsed.error.code)) {
      return { response: errorResponse(parsed.error.code, requestId, cors), errorCode: parsed.error.code };
    }
  }
  return { response: errorResponse("UPSTREAM_UNAVAILABLE", requestId, cors), errorCode: "UPSTREAM_UNAVAILABLE" };
}

function methodNotAllowed(allow: string, requestId: string, cors: Headers): Response {
  const headers = new Headers(cors);
  headers.set("allow", allow);
  return errorResponse("METHOD_NOT_ALLOWED", requestId, headers);
}

function isTimeoutError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error.name === "TimeoutError" || error.name === "AbortError");
}

function arrayBufferFrom(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  const view = new Uint8Array(buffer);
  for (let index = 0; index < bytes.byteLength; index += 1) {
    const byte = bytes[index];
    if (byte !== undefined) view[index] = byte;
  }
  return buffer;
}

function defaultLog(fields: GatewayLog): void {
  const event = {
    timestamp: new Date().toISOString(),
    service: "itt-agent-gateway",
    ...fields,
  };
  console.log(JSON.stringify(event));
}
