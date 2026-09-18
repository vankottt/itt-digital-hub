import { ANONYMOUS_QUESTION_LIMIT, type AiActSession } from "./types";

export function createBlankSession(): AiActSession {
  return {
    anonymousSessionId: "",
    marketingConsent: false,
    questionsAsked: 0,
    conversationEvents: [],
    topics: [],
    kitDownloadRequested: false,
    kitDownloaded: false,
    ctaInteractions: [],
    leadCaptured: false,
    messages: [],
  };
}

export function ensureSessionId(session: AiActSession): AiActSession {
  if (session.anonymousSessionId) return session;
  const id = globalThis.crypto?.randomUUID?.() ?? `sess-${Date.now()}`;
  return { ...session, anonymousSessionId: id };
}

export function needsLeadGate(session: Pick<AiActSession, "questionsAsked" | "leadCaptured">): boolean {
  return session.questionsAsked >= ANONYMOUS_QUESTION_LIMIT && !session.leadCaptured;
}

export function remainingAnonymousQuestions(session: Pick<AiActSession, "questionsAsked" | "leadCaptured">): number {
  if (session.leadCaptured) return Number.POSITIVE_INFINITY;
  return Math.max(0, ANONYMOUS_QUESTION_LIMIT - session.questionsAsked);
}

export function applyLeadToSession(session: AiActSession, lead: Pick<AiActSession, "name" | "workEmail" | "company" | "role" | "marketingConsent">): AiActSession {
  return {
    ...session,
    name: lead.name,
    workEmail: lead.workEmail,
    company: lead.company,
    role: lead.role,
    marketingConsent: lead.marketingConsent,
    leadCaptured: true,
    conversationEvents: [
      ...session.conversationEvents,
      { type: "lead_submitted", at: new Date().toISOString() },
    ],
  };
}

export function recordEvent(session: AiActSession, type: string): AiActSession {
  return {
    ...session,
    conversationEvents: [...session.conversationEvents, { type, at: new Date().toISOString() }],
  };
}
