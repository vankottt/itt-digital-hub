"use client";

import { createBlankSession, ensureSessionId } from "./session";
import { AI_ACT_SESSION_STORAGE_KEY, type AiActSession } from "./types";

type Listener = () => void;

const GATE_MIRROR_KEY = "itt-ai-act-gate-v1";

const listeners = new Set<Listener>();
const serverSession = createBlankSession();
let clientSession: AiActSession | null = null;
let hydrateScheduled = false;

interface GateMirror {
  gateToken?: string;
  questionsAsked?: number;
  leadCaptured?: boolean;
}

function readStoredSession(): AiActSession {
  try {
    const raw = sessionStorage.getItem(AI_ACT_SESSION_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AiActSession) : createBlankSession();
    if (!parsed || typeof parsed !== "object") return mergeGate(ensureSessionId(createBlankSession()), readGateMirror());
    return mergeGate(ensureSessionId({ ...createBlankSession(), ...parsed, messages: parsed.messages ?? [] }), readGateMirror());
  } catch {
    return mergeGate(ensureSessionId(createBlankSession()), readGateMirror());
  }
}

function readGateMirror(): GateMirror | null {
  try {
    const raw = localStorage.getItem(GATE_MIRROR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GateMirror;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function mergeGate(session: AiActSession, mirror: GateMirror | null): AiActSession {
  if (!mirror) return session;
  const questionsAsked =
    typeof mirror.questionsAsked === "number" ? Math.max(session.questionsAsked, mirror.questionsAsked) : session.questionsAsked;
  const gateToken = mirror.gateToken || session.gateToken;
  const leadCaptured = session.leadCaptured || Boolean(mirror.leadCaptured && mirror.gateToken);
  return { ...session, questionsAsked, ...(gateToken ? { gateToken } : {}), leadCaptured };
}

function persist(session: AiActSession): void {
  try {
    sessionStorage.setItem(AI_ACT_SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(
      GATE_MIRROR_KEY,
      JSON.stringify({
        gateToken: session.gateToken,
        questionsAsked: session.questionsAsked,
        leadCaptured: session.leadCaptured,
      } satisfies GateMirror),
    );
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
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== GATE_MIRROR_KEY || !clientSession) return;
    const next = mergeGate(clientSession, readGateMirror());
    if (
      next.questionsAsked === clientSession.questionsAsked &&
      next.gateToken === clientSession.gateToken &&
      next.leadCaptured === clientSession.leadCaptured
    ) {
      return;
    }
    clientSession = next;
    try {
      sessionStorage.setItem(AI_ACT_SESSION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeAiActSession(next: AiActSession): void {
  clientSession = next;
  persist(next);
  emit();
}
