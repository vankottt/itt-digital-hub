import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, cookieOptions } from "./session";
import { isAdminRequest } from "./config";

export async function isAdminSession() {
  const cookieStore = await cookies();
  return isAdminRequest(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function writeAdminCookie(key: string) {
  const expected = process.env.LAND_SCOPE_ADMIN_KEY?.trim() ?? "";
  if (!expected || expected.length < 12) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, expected, { ...cookieOptions(), maxAge: 60 * 60 * 12 });
  return true;
}
