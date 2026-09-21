import { NextRequest, NextResponse } from "next/server";
import { CONTACT_INTERESTS, EMPLOYEE_RANGES, PAIN_POINTS, PROJECT_TIMELINES, USE_CASES } from "@/settlement-analyzer/conference/constants";
import { assertSameOrigin, cleanStringArray, cleanText } from "@/settlement-analyzer/server/security";
import { ensureSession } from "@/settlement-analyzer/server/session";
import { saveProfileStore } from "@/settlement-analyzer/server/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await ensureSession(request);
    if (!session.contactId) return NextResponse.json({ error: "Необходима е професионална регистрация." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const employeeRange = cleanText(body.employeeRange, 80);
    const useCases = cleanStringArray(body.useCases, USE_CASES);
    const painPoints = cleanStringArray(body.painPoints, PAIN_POINTS);
    const projectTimeline = cleanText(body.projectTimeline, 100);
    const contactInterest = cleanText(body.contactInterest, 100);
    if (!EMPLOYEE_RANGES.includes(employeeRange as typeof EMPLOYEE_RANGES[number])) return error("Моля, посочете приблизителна големина на организацията.");
    if (useCases.length === 0) return error("Изберете поне една възможна употреба.");
    if (painPoints.length === 0) return error("Изберете поне една дейност, която отнема време.");
    if (!PROJECT_TIMELINES.includes(projectTimeline as typeof PROJECT_TIMELINES[number])) return error("Моля, посочете хоризонт за проект или задача.");
    if (!CONTACT_INTERESTS.includes(contactInterest as typeof CONTACT_INTERESTS[number])) return error("Моля, посочете интереса си към разговор.");
    const wantsContact = contactInterest !== "Засега не";
    const result = await saveProfileStore(session.sessionId, session.contactId, {
      employeeRange,
      useCases: JSON.stringify(useCases),
      painPoints: JSON.stringify(painPoints),
      projectTimeline,
      contactInterest,
      phone: wantsContact ? cleanText(body.phone, 40) : "",
      jobRole: wantsContact ? cleanText(body.jobRole, 100) : "",
    });
    if (result.error === "not_found") return NextResponse.json({ error: "Профилът не беше намерен." }, { status: 404 });
    if (result.error) return NextResponse.json({ error: "Профилът не беше записан. Моля, опитайте отново." }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Профилът не беше записан. Моля, опитайте отново." }, { status: 503 });
  }
}

function error(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
