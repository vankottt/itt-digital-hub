import { headers } from "next/headers";

const hits = new Map<string, number[]>();

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function tooManyRequests(kind: "chat" | "lead", windowMs = 60 * 60 * 1000): Promise<boolean> {
  const max = kind === "chat" ? 120 : 40;
  const now = Date.now();
  const key = `${kind}:${await clientKey()}`;
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}
