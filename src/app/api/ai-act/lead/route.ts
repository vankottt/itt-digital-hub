import { NextResponse } from "next/server";
import { parseLeadPayload } from "@/lib/ai-act/lead";

export const runtime = "nodejs";

/**
 * Validates lead shape. Goal 2 persists. Goal 1 returns persisted: false
 * so the client can continue without pretending a database write succeeded.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "invalid" } }, { status: 400 });
  }

  const parsed = parseLeadPayload(body);
  if (parsed.kind === "spam") return NextResponse.json({ ok: true, persisted: false });
  if (parsed.kind === "invalid") return NextResponse.json({ ok: false, error: { code: "invalid" } }, { status: 400 });

  return NextResponse.json({
    ok: true,
    persisted: false,
    sessionId: parsed.data.anonymousSessionId,
  });
}
