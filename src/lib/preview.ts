import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { issuePreviewToken, readPreviewToken, type PreviewGrant } from "./preview-token";

const COOKIE = "cit_preview";

export type { PreviewGrant };

export async function setPreviewCookie(grant: Omit<PreviewGrant, "exp">): Promise<string> {
  const token = issuePreviewToken(grant);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return token;
}

export async function getPreviewGrant(): Promise<PreviewGrant | null> {
  try {
    const jar = await cookies();
    return readPreviewToken(jar.get(COOKIE)?.value);
  } catch {
    return null;
  }
}

export function newUploadId(): string {
  return randomBytes(16).toString("hex");
}

export { issuePreviewToken, readPreviewToken };
