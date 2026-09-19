import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ANONYMOUS_QUESTION_LIMIT } from "./types";

export const AI_ACT_GATE_COOKIE = "itt_ai_act_gate";
export const GATE_MAX_AGE_SECONDS = 60 * 60 * 12;

export interface GateLead {
  id?: string;
  name: string;
  workEmail: string;
  company: string;
  role: string;
  marketingConsent: boolean;
}

export interface GateState {
  sid: string;
  q: number;
  lead?: GateLead;
  exp: number;
}

export function encodeGateState(state: GateState, secret: string): string {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function decodeGateState(token: string | undefined, secret: string): GateState | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GateState;
    if (!state?.sid || typeof state.q !== "number") return null;
    if (state.exp < Date.now()) return null;
    return state;
  } catch {
    return null;
  }
}

export function createGateState(sessionId?: string): GateState {
  return {
    sid: sessionId?.trim() || randomUUID(),
    q: 0,
    exp: Date.now() + GATE_MAX_AGE_SECONDS * 1000,
  };
}

export function gateAllowsChat(state: GateState): boolean {
  return Boolean(state.lead) || state.q < ANONYMOUS_QUESTION_LIMIT;
}

export function incrementAnonymousCount(state: GateState): GateState {
  if (state.lead) return { ...state, exp: Date.now() + GATE_MAX_AGE_SECONDS * 1000 };
  return { ...state, q: state.q + 1, exp: Date.now() + GATE_MAX_AGE_SECONDS * 1000 };
}

export function attachLead(state: GateState, lead: GateLead): GateState {
  return { ...state, lead, exp: Date.now() + GATE_MAX_AGE_SECONDS * 1000 };
}
