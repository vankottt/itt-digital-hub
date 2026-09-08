import { createHmac, timingSafeEqual } from "node:crypto";
import { requirePreviewSecret } from "@/lib/auth/secrets";

export interface PreviewGrant {
  kind: "project" | "insight" | "person";
  slug: string;
  exp: number;
}

export function previewSecret(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): string {
  return requirePreviewSecret(env);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function issuePreviewToken(grant: Omit<PreviewGrant, "exp">, ttlMs = 1000 * 60 * 60 * 4, env?: Record<string, string | undefined>): string {
  const payload = Buffer.from(JSON.stringify({ ...grant, exp: Date.now() + ttlMs }), "utf8").toString("base64url");
  return `${payload}.${sign(payload, previewSecret(env))}`;
}

export function readPreviewToken(token: string | undefined, env?: Record<string, string | undefined>): PreviewGrant | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload, previewSecret(env));
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const grant = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PreviewGrant;
    if (grant.exp < Date.now()) return null;
    return grant;
  } catch {
    return null;
  }
}
