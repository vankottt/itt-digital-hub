import { siteUrl } from "@/lib/site-url";
import { VIK_TOOL_NAMES } from "../engine/tools";

export const DEFAULT_COMPARISON_MODEL = "gpt-5.6";
export const COMPARISON_MAX_OUTPUT_TOKENS = 2200;
export const COMPARISON_TIMEOUT_MS = 45_000;

export const CONTROL_INSTRUCTIONS =
  "Answer the user's question helpfully and accurately using your general model capabilities. No external ViK-specific tools or ITT domain knowledge are available.";

type Env = Record<string, string | undefined>;

export function comparisonModel(env: Env = process.env): string {
  const configured = env.VIK_COMPARISON_MODEL?.trim();
  return configured || DEFAULT_COMPARISON_MODEL;
}

export function publicMcpUrl(env: Env = process.env): string {
  const explicit = env.VIK_MCP_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return `${siteUrl(env)}/api/mcp/vik`;
}

export function expertMcpTool(env: Env = process.env) {
  return {
    type: "mcp" as const,
    server_label: "vik",
    server_description: "ITT Digital Hub ViK Projektant: source retrieval and deterministic engineering calculations.",
    server_url: publicMcpUrl(env),
    require_approval: "never" as const,
    allowed_tools: [...VIK_TOOL_NAMES],
  };
}
