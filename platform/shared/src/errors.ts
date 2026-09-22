import { HEADER_REQUEST_ID, isRequestId } from "./constants";

export const ERROR_CODES = [
  "INVALID_JSON",
  "INVALID_CONTENT_TYPE",
  "INVALID_BODY",
  "MESSAGE_TOO_LONG",
  "BODY_TOO_LARGE",
  "METHOD_NOT_ALLOWED",
  "ORIGIN_NOT_ALLOWED",
  "NOT_FOUND",
  "AGENT_NOT_FOUND",
  "AGENT_DISABLED",
  "LEAD_REQUIRED",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_TIMEOUT",
  "NOT_CONFIGURED",
  "UPSTREAM_UNAVAILABLE",
  "UPSTREAM_TIMEOUT",
  "INVALID_SIGNATURE",
  "SIGNATURE_EXPIRED",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const MESSAGES: Record<ErrorCode, string> = {
  INVALID_JSON: "Request body must be valid JSON.",
  INVALID_CONTENT_TYPE: "Content-Type must be application/json.",
  INVALID_BODY: "Request is invalid.",
  MESSAGE_TOO_LONG: "Message is too long.",
  BODY_TOO_LARGE: "Request body is too large.",
  METHOD_NOT_ALLOWED: "Method is not allowed.",
  ORIGIN_NOT_ALLOWED: "Origin is not allowed.",
  NOT_FOUND: "Not found.",
  AGENT_NOT_FOUND: "Agent is not available.",
  AGENT_DISABLED: "Agent is disabled.",
  LEAD_REQUIRED: "A few details are required before continuing.",
  RATE_LIMITED: "Please wait a moment and try again.",
  PROVIDER_UNAVAILABLE: "The assistant is temporarily unavailable.",
  PROVIDER_TIMEOUT: "The assistant took too long to respond.",
  NOT_CONFIGURED: "The assistant is not available.",
  UPSTREAM_UNAVAILABLE: "Agent service is unavailable.",
  UPSTREAM_TIMEOUT: "Agent service timed out.",
  INVALID_SIGNATURE: "Request could not be authenticated.",
  SIGNATURE_EXPIRED: "Request could not be authenticated.",
  INTERNAL: "Something went wrong.",
};

const STATUSES: Record<ErrorCode, number> = {
  INVALID_JSON: 400,
  INVALID_CONTENT_TYPE: 415,
  INVALID_BODY: 400,
  MESSAGE_TOO_LONG: 400,
  BODY_TOO_LARGE: 413,
  METHOD_NOT_ALLOWED: 405,
  ORIGIN_NOT_ALLOWED: 403,
  NOT_FOUND: 404,
  AGENT_NOT_FOUND: 404,
  AGENT_DISABLED: 403,
  LEAD_REQUIRED: 403,
  RATE_LIMITED: 429,
  PROVIDER_UNAVAILABLE: 503,
  PROVIDER_TIMEOUT: 504,
  NOT_CONFIGURED: 503,
  UPSTREAM_UNAVAILABLE: 502,
  UPSTREAM_TIMEOUT: 504,
  INVALID_SIGNATURE: 401,
  SIGNATURE_EXPIRED: 401,
  INTERNAL: 500,
};

const ERROR_CODE_SET = new Set<string>(ERROR_CODES);

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
  };
}

export function publicMessage(code: ErrorCode): string {
  return MESSAGES[code];
}

export function statusFor(code: ErrorCode): number {
  return STATUSES[code];
}

export function isErrorCode(value: string): value is ErrorCode {
  return ERROR_CODE_SET.has(value);
}

export function parseErrorBody(value: unknown): ErrorBody | null {
  if (!isRecord(value) || !isRecord(value.error)) return null;
  const code = value.error.code;
  const message = value.error.message;
  const requestId = value.error.requestId;
  if (typeof code !== "string" || !isErrorCode(code)) return null;
  if (typeof message !== "string" || message !== publicMessage(code)) return null;
  if (typeof requestId !== "string" || !isRequestId(requestId)) return null;
  return { error: { code, message, requestId } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function errorResponse(code: ErrorCode, requestId: string, extra?: Headers): Response {
  const headers = baseHeaders(requestId, extra);
  const body: ErrorBody = {
    error: {
      code,
      message: publicMessage(code),
      requestId,
    },
  };
  return new Response(JSON.stringify(body), { status: statusFor(code), headers });
}

export function jsonResponse(body: unknown, status: number, requestId?: string, extra?: Headers): Response {
  const headers = baseHeaders(requestId, extra);
  return new Response(JSON.stringify(body), { status, headers });
}

function baseHeaders(requestId: string | undefined, extra?: Headers): Headers {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  if (requestId) headers.set(HEADER_REQUEST_ID, requestId);
  return headers;
}
