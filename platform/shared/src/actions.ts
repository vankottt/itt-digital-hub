import { parseClientState, type ClientState, type Locale } from "./chat";

export interface ParsedActionRequest {
  sessionId?: string;
  locale: Locale;
  input: Record<string, unknown>;
  clientState?: ClientState;
}

export interface ActionSuccessBody {
  requestId: string;
  agentId: string;
  actionId: string;
  result: ClientState;
  state?: ClientState;
}

export type ActionParseResult =
  | { ok: true; value: ParsedActionRequest }
  | { ok: false; code: "INVALID_BODY" };

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function parseActionPayload(input: unknown): ActionParseResult {
  if (!isRecord(input)) return { ok: false, code: "INVALID_BODY" };

  const locale = parseLocale(input.locale);
  if (!locale) return { ok: false, code: "INVALID_BODY" };

  const sessionId = parseSessionId(input.sessionId);
  if (sessionId === null) return { ok: false, code: "INVALID_BODY" };

  if (!isRecord(input.input)) return { ok: false, code: "INVALID_BODY" };

  const clientState = parseClientState(input.clientState);
  if (!clientState.ok) return { ok: false, code: "INVALID_BODY" };

  return {
    ok: true,
    value: {
      ...(sessionId ? { sessionId } : {}),
      locale,
      input: input.input,
      ...(clientState.value ? { clientState: clientState.value } : {}),
    },
  };
}

function parseLocale(value: unknown): Locale | null {
  if (value === undefined) return "bg";
  if (value === "bg" || value === "en") return value;
  return null;
}

function parseSessionId(value: unknown): string | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 80) return null;
  if (!SESSION_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
