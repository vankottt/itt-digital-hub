import { mcpHealth } from "@/ai-act/mcp/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(mcpHealth());
}
