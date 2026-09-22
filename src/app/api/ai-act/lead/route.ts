import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Lead writes now go through the Agent Hub. This route must not touch Supabase or Resend. */
export function POST() {
  return NextResponse.json({ ok: false, error: { code: "not_configured" } }, { status: 410 });
}
