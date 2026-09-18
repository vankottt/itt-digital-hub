"use client";

import { createBlankSession, ensureSessionId } from "./session";
import { AI_ACT_SESSION_STORAGE_KEY, type AiActSession } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
const serverSession = createBlankSession();
let clientSession: AiActSession | null = null;
let hydrateScheduled = false;

function readStoredSession(): AiActSession {
  try {
    const raw = sessionStorage.getItem(AI_ACT_SESSION_STORAGE_KEY);
    if (!raw) return ensureSessionId(createBlankSession());
    const parsed = JSON.parse(raw) as AiActSession;
    if (!parsed || typeof parsed !== "object") return ensureSessionId(createBlankSession());
    return ensureSessionId({ ...createBlankSession(), ...parsed, messages: parsed.messages ?? [] });
  } catch {
    return ensureSessionId(createBlankSession());
  }
}

function persist(session: AiActSession): void {
  try {
    sessionStorage.setItem(AI_ACT_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* private mode */
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function hydrateFromStorage(): AiActSession {
  if (!clientSession) {
    clientSession = readStoredSession();
    persist(clientSession);
  }
  return clientSession;
}

export function getServerAiActSession(): AiActSession {
  return serverSession;
}

/** Same reference as the server snapshot until the store hydrates after subscribe. */
export function getClientAiActSession(): AiActSession {
  return clientSession ?? serverSession;
}

export function ensureAiActSession(): AiActSession {
  if (clientSession?.anonymousSessionId) return clientSession;
  const session = hydrateFromStorage();
  emit();
  return session;
}

export function subscribeAiActSession(listener: Listener): () => void {
  listeners.add(listener);
  if (!hydrateScheduled) {
    hydrateScheduled = true;
    queueMicrotask(() => {
      hydrateFromStorage();
      emit();
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

export function writeAiActSession(next: AiActSession): void {
  clientSession = next;
  persist(next);
  emit();
}
