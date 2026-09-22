import { DEFAULT_ALLOWED_ORIGINS } from "./constants";

export function parseAllowedOrigins(value: string | undefined): string[] {
  const source = value?.trim() ? value : DEFAULT_ALLOWED_ORIGINS.join(",");
  const origins = source
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== "*");
  return origins.length > 0 ? origins : [...DEFAULT_ALLOWED_ORIGINS];
}

export type OriginDecision = "absent" | "allowed" | "rejected";

export function originDecision(requestOrigin: string | null, allowed: readonly string[]): OriginDecision {
  if (!requestOrigin) return "absent";
  return allowed.includes(requestOrigin) ? "allowed" : "rejected";
}

export function corsHeaders(requestOrigin: string | null, allowed: readonly string[]): Headers {
  const headers = new Headers();
  if (originDecision(requestOrigin, allowed) !== "allowed" || !requestOrigin) return headers;
  headers.set("access-control-allow-origin", requestOrigin);
  headers.set("vary", "Origin");
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "Content-Type");
  headers.set("access-control-expose-headers", "X-ITT-Request-ID");
  headers.set("access-control-max-age", "600");
  return headers;
}
