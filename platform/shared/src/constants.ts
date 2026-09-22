export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_HISTORY_MESSAGES = 40;
export const MIN_SESSION_ID_CHARS = 8;
export const MAX_SESSION_ID_CHARS = 80;
export const MAX_ANSWER_CHARS = 32_000;
export const SIGNATURE_MAX_SKEW_SECONDS = 300;
export const DEFAULT_UPSTREAM_TIMEOUT_MS = 40_000;
export const MIN_UPSTREAM_TIMEOUT_MS = 50;
export const MAX_UPSTREAM_TIMEOUT_MS = 180_000;
export const DEFAULT_HUB_PORT = 8788;
export const DEFAULT_HUB_HOST = "127.0.0.1";
export const MIN_SHARED_SECRET_CHARS = 16;
export const DEV_PLACEHOLDER_SECRET = "dev-only-shared-secret-change-me";
export const DEFAULT_ALLOWED_ORIGINS = ["https://ittdigitalhub.org", "http://localhost:3000"] as const;

export const HEADER_TIMESTAMP = "x-itt-timestamp";
export const HEADER_SIGNATURE = "x-itt-signature";
export const HEADER_REQUEST_ID = "x-itt-request-id";

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHAT_PATH_PATTERN = /^\/v1\/agents\/([a-z0-9][a-z0-9-]{0,63})\/chat$/;
const ACTION_PATH_PATTERN = /^\/v1\/agents\/([a-z0-9][a-z0-9-]{0,63})\/actions\/([a-z][a-z0-9-]{0,63})$/;

export function isRequestId(value: string): boolean {
  return REQUEST_ID_PATTERN.test(value);
}

export function matchChatPath(pathname: string): string | null {
  return pathname.match(CHAT_PATH_PATTERN)?.[1] ?? null;
}

export function matchActionPath(pathname: string): { agentId: string; actionId: string } | null {
  const match = pathname.match(ACTION_PATH_PATTERN);
  const agentId = match?.[1];
  const actionId = match?.[2];
  if (!agentId || !actionId) return null;
  return { agentId, actionId };
}

export function isPlaceholderSecret(secret: string): boolean {
  return secret === DEV_PLACEHOLDER_SECRET;
}
