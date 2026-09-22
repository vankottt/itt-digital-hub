import { createHmac, randomUUID } from "node:crypto";
import type { GatewayEnv } from "../../platform/gateway/src/handler";
import { createLogger, type Logger } from "../../platform/agent-hub/src/log";
import { createHubRuntime, type HubRuntime } from "../../platform/agent-hub/src/server";
import { canonicalBytes, signRequest, type ChatSuccessBody, type ErrorBody } from "../../platform/shared/src/index";

export const SECRET = "test-hub-shared-secret";

export function gatewayEnv(overrides: Partial<GatewayEnv> = {}): GatewayEnv {
  return {
    GATEWAY_ENV: "test",
    AGENT_HUB_ORIGIN: "http://127.0.0.1:9",
    AGENT_HUB_SHARED_SECRET: SECRET,
    ALLOWED_ORIGINS: "https://ittdigitalhub.org,http://localhost:3000",
    UPSTREAM_TIMEOUT_MS: "25000",
    ...overrides,
  };
}

export function runtimeWith(lines: string[], overrides: Partial<HubRuntime> = {}): HubRuntime {
  return createHubRuntime({
    secret: SECRET,
    log: createLogger({ level: "debug", write: (line) => lines.push(line) }),
    ...overrides,
  });
}

export function quietLog(): Logger {
  return createLogger({ level: "error", write: () => undefined });
}

export function chatBody(message = "hello", extra: Record<string, unknown> = {}): string {
  return JSON.stringify({ locale: "en", message, ...extra });
}

export async function signedHubRequest(
  options: {
    agentId?: string;
    path?: string;
    rawBody?: string;
    secret?: string;
    timestamp?: number;
    requestId?: string;
    signature?: string | null;
    method?: string;
    contentType?: string | null;
    search?: string;
  } = {},
): Promise<Request> {
  const agentId = options.agentId ?? "mock";
  const path = options.path ?? `/v1/agents/${agentId}/chat`;
  const rawBody = options.rawBody ?? chatBody();
  const body = new TextEncoder().encode(rawBody);
  const timestamp = String(options.timestamp ?? Math.floor(Date.now() / 1000));
  const requestId = options.requestId ?? randomUUID();
  const signature =
    options.signature === null
      ? null
      : (options.signature ??
        (await signRequest({
          secret: options.secret ?? SECRET,
          timestamp,
          method: "POST",
          path,
          requestId,
          body,
        })));
  const headers = new Headers();
  if (options.contentType !== null) headers.set("content-type", options.contentType ?? "application/json");
  headers.set("x-itt-timestamp", timestamp);
  headers.set("x-itt-request-id", requestId);
  if (signature) headers.set("x-itt-signature", signature);
  const method = options.method ?? "POST";
  return new Request(`http://127.0.0.1${path}${options.search ?? ""}`, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : rawBody,
  });
}

export function nodeHmac(parts: {
  secret: string;
  timestamp: string;
  method: string;
  path: string;
  requestId: string;
  body: Uint8Array;
}): string {
  return createHmac("sha256", parts.secret).update(Buffer.from(canonicalBytes(parts))).digest("hex");
}

export async function readError(response: Response): Promise<ErrorBody> {
  return (await response.json()) as ErrorBody;
}

export async function readSuccess(response: Response): Promise<ChatSuccessBody> {
  return (await response.json()) as ChatSuccessBody;
}
