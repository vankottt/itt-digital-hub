import { NextRequest, NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";
import { ORGANIZATION_TYPES, PRIVACY_VERSION } from "@/settlement-analyzer/conference/constants";
import { sa } from "@/settlement-analyzer/copy";
import { assertSameOrigin, cleanEmail, cleanText } from "@/settlement-analyzer/server/security";
import { ensureSession, setContactCookie } from "@/settlement-analyzer/server/session";
import { registerStore } from "@/settlement-analyzer/server/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const locale: Locale = isLocale(String(body.locale ?? "")) ? (body.locale as Locale) : "bg";
  const copy = sa(locale);
  try {
    assertSameOrigin(request);
    const session = await ensureSession(request);
    if (session.contactId) return NextResponse.json({ ok: true, existing: true });
    const fullName = cleanText(body.fullName, 120);
    const email = cleanEmail(body.email);
    const companyName = cleanText(body.companyName, 160);
    const organizationType = cleanText(body.organizationType, 100);
    const marketingConsent = body.marketingConsent === true;
    if (fullName.length < 3) return error(copy.registerNameError);
    if (!email) return error(copy.registerEmailError);
    if (companyName.length < 2) return error(copy.registerOrgError);
    if (!ORGANIZATION_TYPES.includes(organizationType as typeof ORGANIZATION_TYPES[number])) {
      return error(copy.registerTypeError);
    }
    const result = await registerStore(session.sessionId, {
      fullName,
      email,
      companyName,
      organizationType,
      marketingConsent,
      privacyVersion: PRIVACY_VERSION,
    });
    if (result.error === "duplicate_email") {
      return NextResponse.json({ error: copy.registerDuplicate }, { status: 409 });
    }
    if (result.error) return NextResponse.json({ error: copy.registerError }, { status: 500 });
    if (result.contactId) await setContactCookie(result.contactId);
    return NextResponse.json({ ok: true, fullName: result.fullName ?? fullName });
  } catch (cause) {
    const invalid = cause instanceof Error && cause.message === "Невалидна заявка.";
    const message = invalid ? copy.invalidRequest : copy.registerError;
    return NextResponse.json({ error: message }, { status: invalid ? 403 : 500 });
  }
}

function error(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
