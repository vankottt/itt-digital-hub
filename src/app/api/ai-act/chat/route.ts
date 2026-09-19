import { NextResponse } from "next/server";
import { completeAiActChat } from "@/lib/ai-act/service";
import { parseChatRequest } from "@/lib/ai-act/chat-request";
import { AiActProviderError } from "@/lib/ai-act/errors";
import { gateAllowsChat, incrementAnonymousCount, loadOrCreateGate, writeGateCookie } from "@/lib/ai-act/gate";
import { tooManyRequests } from "@/lib/ai-act/limits";
import type { AiActChatResponse, AiActErrorCode } from "@/lib/ai-act/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function fail(code: AiActErrorCode, status: number) {
  const body: AiActChatResponse = { ok: false, error: { code } };
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }

  const parsed = parseChatRequest(body);
  if (parsed.kind === "invalid") return fail("invalid", 400);
  if (await tooManyRequests("chat")) return fail("rate_limited", 429);

  const gate = await loadOrCreateGate(parsed.data.sessionId);
  if (!gateAllowsChat(gate)) return fail("lead_required", 403);

  try {
    const result = await completeAiActChat({
      locale: parsed.data.locale,
      messages: parsed.data.messages,
    });
    await writeGateCookie(incrementAnonymousCount(gate));
    const payload: AiActChatResponse = {
      ok: true,
      message: { role: "assistant", content: result.text },
    };
    return NextResponse.json(payload);
  } catch (error) {
    const code: AiActErrorCode = error instanceof AiActProviderError ? error.code : "provider_error";
    const status = code === "invalid" ? 400 : code === "rate_limited" ? 429 : code === "timeout" || code === "network" ? 504 : 503;
    return fail(code, status);
  }
}
