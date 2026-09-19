import { cookies } from "next/headers";
import { isInternetFacing } from "@/lib/env-runtime";
import { resolveSessionSecret } from "@/lib/auth/secrets";
import {
  AI_ACT_GATE_COOKIE,
  GATE_MAX_AGE_SECONDS,
  createGateState,
  decodeGateState,
  encodeGateState,
  type GateState,
} from "./gate-token";

export {
  AI_ACT_GATE_COOKIE,
  attachLead,
  createGateState,
  gateAllowsChat,
  incrementAnonymousCount,
  type GateLead,
  type GateState,
} from "./gate-token";

function signingSecret(): string {
  const resolved = resolveSessionSecret();
  if (!resolved.ok) throw new Error(resolved.error);
  return `ai-act-gate:${resolved.secret}`;
}

export async function readGateCookie(): Promise<GateState | null> {
  const jar = await cookies();
  return decodeGateState(jar.get(AI_ACT_GATE_COOKIE)?.value, signingSecret());
}

export async function writeGateCookie(state: GateState): Promise<void> {
  const jar = await cookies();
  jar.set(AI_ACT_GATE_COOKIE, encodeGateState(state, signingSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: isInternetFacing(),
    path: "/",
    maxAge: GATE_MAX_AGE_SECONDS,
  });
}

export async function loadOrCreateGate(sessionId?: string): Promise<GateState> {
  const existing = await readGateCookie();
  if (existing) return existing;
  return createGateState(sessionId);
}
