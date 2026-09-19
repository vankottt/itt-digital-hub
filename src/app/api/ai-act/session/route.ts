import { NextResponse } from "next/server";
import { readGateCookie } from "@/lib/ai-act/gate";

export const runtime = "nodejs";

export async function GET() {
  const gate = await readGateCookie();
  if (!gate) {
    return NextResponse.json({ ok: true, leadCaptured: false, questionsAsked: 0 });
  }
  return NextResponse.json({
    ok: true,
    leadCaptured: Boolean(gate.lead),
    questionsAsked: gate.q,
    lead: gate.lead
      ? {
          name: gate.lead.name,
          workEmail: gate.lead.workEmail,
          company: gate.lead.company,
          role: gate.lead.role,
          marketingConsent: gate.lead.marketingConsent,
        }
      : undefined,
  });
}
