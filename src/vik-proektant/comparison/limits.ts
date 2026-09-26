import { createHash } from "node:crypto";

type Bucket = { tokens: number; updated: number };

const buckets = new Map<string, Bucket>();

export type TokenResult = { ok: true } | { ok: false; retryAfterMs: number };

export function takeToken(key: string, limit: number, windowMs: number, now = Date.now()): TokenResult {
  if (buckets.size > 5000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  const current = buckets.get(key);
  if (!current || now - current.updated >= windowMs) {
    buckets.set(key, { tokens: limit - 1, updated: now });
    return { ok: true };
  }
  if (current.tokens <= 0) return { ok: false, retryAfterMs: Math.max(1, windowMs - (now - current.updated)) };
  current.tokens -= 1;
  return { ok: true };
}

export function resetRateLimits(): void {
  buckets.clear();
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return createHash("sha256").update(forwarded).digest("hex").slice(0, 16);
}

export function promptHash(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}
