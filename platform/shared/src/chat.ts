import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  MAX_SESSION_ID_CHARS,
  MIN_SESSION_ID_CHARS,
} from "./constants";
import type { ErrorCode } from "./errors";

export type Locale = "bg" | "en";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type ClientState = Record<string, string | number | boolean>;

export interface ParsedChatRequest {
  sessionId?: string;
  locale: Locale;
  message: string;
  history: ChatTurn[];
  clientState?: ClientState;
}

export interface ChatSuccessBody {
  requestId: string;
  agentId: string;
  sessionId: string;
  answer: string;
  state?: ClientState;
}

export type ChatParseResult =
  | { ok: true; value: ParsedChatRequest }
  | { ok: false; code: Extract<ErrorCode, "INVALID_BODY" | "MESSAGE_TOO_LONG"> };

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function parseChatPayload(input: unknown): ChatParseResult {
  if (!isRecord(input)) return { ok: false, code: "INVALID_BODY" };

  const locale = parseLocale(input.locale);
  if (!locale) return { ok: false, code: "INVALID_BODY" };

  const sessionId = parseSessionId(input.sessionId);
  if (sessionId === null) return { ok: false, code: "INVALID_BODY" };

  if (typeof input.message !== "string") return { ok: false, code: "INVALID_BODY" };
  const message = input.message.trim();
  if (message.length < 1) return { ok: false, code: "INVALID_BODY" };
  if (message.length > MAX_MESSAGE_CHARS) return { ok: false, code: "MESSAGE_TOO_LONG" };

  const history = parseHistory(input.history);
  if (!history) return { ok: false, code: "INVALID_BODY" };

  const clientState = parseClientState(input.clientState);
  if (!clientState.ok) return { ok: false, code: "INVALID_BODY" };

  return {
    ok: true,
    value: {
      ...(sessionId ? { sessionId } : {}),
      locale,
      message,
      history,
      ...(clientState.value ? { clientState: clientState.value } : {}),
    },
  };
}

export function parseClientState(value: unknown): { ok: true; value?: ClientState } | { ok: false } {
  if (value === undefined) return { ok: true };
  if (!isRecord(value)) return { ok: false };
  const keys = Object.keys(value);
  if (keys.length > 20) return { ok: false };
  const state: ClientState = {};
  for (const key of keys) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(key)) return { ok: false };
    const item = value[key];
    if (typeof item === "string") {
      if (item.length > 4_000) return { ok: false };
      state[key] = item;
      continue;
    }
    if (typeof item === "number" && Number.isFinite(item)) {
      state[key] = item;
      continue;
    }
    if (typeof item === "boolean") {
      state[key] = item;
      continue;
    }
    return { ok: false };
  }
  if (JSON.stringify(state).length > 8_192) return { ok: false };
  return { ok: true, value: state };
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
  if (trimmed.length < MIN_SESSION_ID_CHARS || trimmed.length > MAX_SESSION_ID_CHARS) return null;
  if (!SESSION_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function parseHistory(value: unknown): ChatTurn[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_HISTORY_MESSAGES) return null;
  const history: ChatTurn[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (item.role !== "user" && item.role !== "assistant") return null;
    if (typeof item.content !== "string") return null;
    const content = item.content.trim();
    if (content.length < 1 || content.length > MAX_MESSAGE_CHARS) return null;
    history.push({ role: item.role, content });
  }
  return history;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
