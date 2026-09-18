import { NextResponse } from "next/server";
import { completeAiActChat } from "@/lib/ai-act/service";
import { parseChatRequest } from "@/lib/ai-act/chat-request";
import { AiActProviderError } from "@/lib/ai-act/errors";
import type { AiActChatResponse, AiActErrorCode } from "@/lib/ai-act/types";

export const runtime = "nodejs";

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

  try {
    const result = await completeAiActChat({
      locale: parsed.data.locale,
      messages: parsed.data.messages,
    });
    const payload: AiActChatResponse = {
      ok: true,
      message: { role: "assistant", content: result.text },
      diagnostics: { provider: result.provider, model: result.model },
    };
    return NextResponse.json(payload);
  } catch (error) {
    const code: AiActErrorCode = error instanceof AiActProviderError ? error.code : "provider_error";
    const status = code === "invalid" ? 400 : code === "rate_limited" ? 429 : 503;
    return fail(code, status);
  }
}
