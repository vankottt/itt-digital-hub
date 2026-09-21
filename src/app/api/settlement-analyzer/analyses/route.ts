import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, cleanText, safeJson } from "@/settlement-analyzer/server/security";
import { ensureSession } from "@/settlement-analyzer/server/session";
import { recordAnalysisStore } from "@/settlement-analyzer/server/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await ensureSession(request);
    if (!session.contactId) return NextResponse.json({ ok: true, recorded: false }, { status: 202 });
    const body = await request.json() as Record<string, unknown>;
    const settlementName = cleanText(body.settlementName, 140);
    if (!settlementName) return NextResponse.json({ error: "Липсва населено място." }, { status: 400 });
    const summary = typeof body.summary === "object" && body.summary ? body.summary : {};
    const result = await recordAnalysisStore(session.sessionId, session.contactId, settlementName, safeJson(summary, 3000));
    return NextResponse.json({ ok: true, recorded: Boolean(result.recorded), analysisCount: Number(result.analysisCount ?? 0) });
  } catch {
    return NextResponse.json({ error: "Анализът е готов, но статистиката не беше записана." }, { status: 503 });
  }
}
