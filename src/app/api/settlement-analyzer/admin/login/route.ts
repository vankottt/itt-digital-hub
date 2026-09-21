import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/settlement-analyzer/server/security";
import { writeAdminCookie } from "@/settlement-analyzer/server/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = await request.json() as { key?: string };
    const ok = await writeAdminCookie(String(body.key ?? ""));
    if (!ok) return NextResponse.json({ error: "Невалиден ключ." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 403 });
  }
}
