import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** The model runtime now lives on the Agent Hub. This route must not call a provider. */
export function POST() {
  return NextResponse.json({ ok: false, error: { code: "not_configured" } }, { status: 410 });
}
