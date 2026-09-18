import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Goal 2 streams the real ZIP. Goal 1 keeps the download UX without a fake archive. */
export async function GET() {
  return NextResponse.json({ ok: false, error: { code: "kit_not_ready" } }, { status: 503 });
}
