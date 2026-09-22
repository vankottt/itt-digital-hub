import { NextResponse } from "next/server";
import { buildAgentKitZip } from "@/lib/ai-act/kit";
import { readGateCookie } from "@/lib/ai-act/gate";
import { gateAllowsKitDownload } from "@/lib/ai-act/kit-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = request.headers.get("x-itt-gate")?.trim();
  const allowed = token ? await gateAllowsKitDownload(token) : Boolean((await readGateCookie())?.lead);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: { code: "lead_required" } }, { status: 403 });
  }

  try {
    const zip = buildAgentKitZip();
    return new NextResponse(Uint8Array.from(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="itt-ai-act-agent-kit.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[ai-act] kit zip failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ ok: false, error: { code: "kit_not_ready" } }, { status: 503 });
  }
}
