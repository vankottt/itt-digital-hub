import { NextRequest, NextResponse } from "next/server";
import { TRACKED_EVENT_NAMES } from "@/settlement-analyzer/conference/constants";
import { assertSameOrigin, cleanText, safeJson } from "@/settlement-analyzer/server/security";
import { ensureSession } from "@/settlement-analyzer/server/session";
import { recordEventStore } from "@/settlement-analyzer/server/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = await request.json() as Record<string, unknown>;
    const eventName = cleanText(body.eventName, 80);
    if (!TRACKED_EVENT_NAMES.includes(eventName as typeof TRACKED_EVENT_NAMES[number])) {
      return NextResponse.json({ error: "Неподдържано събитие." }, { status: 400 });
    }
    const session = await ensureSession(request);
    await recordEventStore(session.sessionId, session.contactId, eventName, safeJson(body.properties));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Събитието не беше записано." }, { status: 503 });
  }
}
