import { handleMcpHttp } from "@/vik-proektant/mcp/http";
import { clientKey, takeToken } from "@/vik-proektant/comparison/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const slot = takeToken(`mcp:${clientKey(request)}`, 600, 60_000);
  if (!slot.ok) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { "retry-after": String(Math.max(1, Math.ceil(slot.retryAfterMs / 1000))) } });
  }
  return handleMcpHttp(request);
}

export function GET(): Response {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { Allow: "POST", "content-type": "application/json" },
  });
}
