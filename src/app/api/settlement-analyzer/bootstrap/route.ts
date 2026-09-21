import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/settlement-analyzer/server/admin-auth";
import { StoreUnavailableError } from "@/settlement-analyzer/server/store";
import { ensureSession } from "@/settlement-analyzer/server/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ownerMode = await isAdminSession();
  try {
    const session = await ensureSession(request);
    return NextResponse.json({
      registered: session.registered || ownerMode,
      ownerMode,
      fullName: session.fullName,
      profileCompleted: session.profileCompleted,
      analysisCount: session.analysisCount,
    });
  } catch (cause) {
    const degraded = cause instanceof StoreUnavailableError;
    return NextResponse.json({
      registered: ownerMode,
      ownerMode,
      profileCompleted: false,
      analysisCount: 0,
      degraded: true,
      message: degraded
        ? "Връзката с базата данни временно не е достъпна. Ако вече сте се регистрирали, можете да продължите с анализа."
        : "Приложението временно не може да зареди професионалния достъп.",
    }, { status: 503 });
  }
}
