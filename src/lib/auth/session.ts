import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { StaffRecord, StaffRole } from "@/lib/cms/types";
import { cmsMode } from "@/lib/cms/mode";
import { getLocalStore } from "@/lib/cms/local-store";
import { requireSessionSecret } from "@/lib/auth/secrets";

const COOKIE = "cit_admin_session";
const MAX_AGE = 60 * 60 * 12;

export interface AdminSession {
  userId: string;
  email: string;
  role: StaffRole;
  exp: number;
}

function secret(): string {
  return requireSessionSecret();
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

export async function setAdminSessionCookie(session: AdminSession): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function localLogin(email: string, password: string): Promise<StaffRecord | null> {
  if (cmsMode() !== "local") return null;
  const expected = process.env.CIT_ADMIN_DEV_PASSWORD;
  if (!expected || !passwordsMatch(password, expected)) return null;
  const store = await getLocalStore();
  const staff = store.staff.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
  return staff ?? null;
}

export function requireRole(session: AdminSession | null, role?: StaffRole): session is AdminSession {
  if (!session) return false;
  if (!role) return true;
  if (role === "editor") return session.role === "admin" || session.role === "editor";
  return session.role === "admin";
}
