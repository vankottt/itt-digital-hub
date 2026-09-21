import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { bootstrapStore } from "./store";
import { cleanText } from "./security";

export const CONTACT_COOKIE = "land_scope_contact_id";
export const SESSION_COOKIE = "land_scope_session_id";
export const ADMIN_COOKIE = "land_scope_admin";

export type Attribution = {
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};

export async function ensureSession(request: NextRequest) {
  const cookieStore = await cookies();
  const attribution = attributionFrom(request);
  const state = await bootstrapStore({
    sessionId: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    contactId: cookieStore.get(CONTACT_COOKIE)?.value ?? null,
    source: attribution.source,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
  });
  cookieStore.set(SESSION_COOKIE, state.sessionId, cookieOptions());
  if (state.contactId) cookieStore.set(CONTACT_COOKIE, state.contactId, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 365 });
  else if (!cookieStore.get(CONTACT_COOKIE)?.value) {
    /* keep existing cookie if bootstrap could not resolve it */
  }
  return state;
}

export async function setContactCookie(contactId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CONTACT_COOKIE, contactId, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 365 });
}

export function attributionFrom(request: NextRequest): Attribution {
  const value = (name: string) => cleanText(request.nextUrl.searchParams.get(name), 120) || null;
  const utmSource = value("utm_source");
  return {
    source: utmSource || "direct",
    utmSource,
    utmMedium: value("utm_medium"),
    utmCampaign: value("utm_campaign"),
    utmContent: value("utm_content"),
  };
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
