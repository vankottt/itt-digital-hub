import { NextResponse } from "next/server";
import { parseLeadPayload } from "@/lib/ai-act/lead";
import { persistLead } from "@/lib/ai-act/lead-store";
import { notifyLead } from "@/lib/ai-act/lead-notify";
import { attachLead, loadOrCreateGate, writeGateCookie } from "@/lib/ai-act/gate";
import { tooManyRequests } from "@/lib/ai-act/limits";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "invalid" } }, { status: 400 });
  }

  const parsed = parseLeadPayload(body);
  if (parsed.kind === "spam") return NextResponse.json({ ok: true, persisted: true });
  if (parsed.kind === "invalid") return NextResponse.json({ ok: false, error: { code: "invalid" } }, { status: 400 });
  if (await tooManyRequests("lead")) return NextResponse.json({ ok: false, error: { code: "rate_limited" } }, { status: 429 });

  try {
    const stored = await persistLead(parsed.data);
    try {
      await notifyLead(stored);
    } catch {
      console.error("[ai-act] lead notify failed");
    }
    const gate = await loadOrCreateGate(parsed.data.anonymousSessionId);
    await writeGateCookie(
      attachLead(gate, {
        id: stored.id,
        name: stored.name,
        workEmail: stored.workEmail,
        company: stored.company,
        role: stored.role,
        marketingConsent: stored.marketingConsent,
      }),
    );
    return NextResponse.json({
      ok: true,
      persisted: true,
      sessionId: stored.sessionId,
    });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "provider_error" } }, { status: 503 });
  }
}
