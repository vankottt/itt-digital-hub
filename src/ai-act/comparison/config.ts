import { siteUrl } from "@/lib/site-url";
import {
  COMPARISON_MAX_OUTPUT_TOKENS,
  COMPARISON_TIMEOUT_MS,
  CONTROL_INSTRUCTIONS,
  DEFAULT_COMPARISON_MODEL,
} from "@/vik-proektant/comparison/config";
import { AI_ACT_TOOL_NAMES } from "../engine/tools";

export { COMPARISON_MAX_OUTPUT_TOKENS, COMPARISON_TIMEOUT_MS, CONTROL_INSTRUCTIONS, DEFAULT_COMPARISON_MODEL };

type Env = Record<string, string | undefined>;

export function comparisonModel(env: Env = process.env): string {
  const configured = env.AI_ACT_COMPARISON_MODEL?.trim() || env.VIK_COMPARISON_MODEL?.trim();
  return configured || DEFAULT_COMPARISON_MODEL;
}

export function publicMcpUrl(env: Env = process.env): string {
  const explicit = env.AI_ACT_MCP_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return `${siteUrl(env)}/api/mcp/ai-act`;
}

export function expertMcpTool(env: Env = process.env) {
  return {
    type: "mcp" as const,
    server_label: "ai-act",
    server_description: "ITT Digital Hub AI Act Assistant: authoritative-source retrieval. It does not call another model.",
    server_url: publicMcpUrl(env),
    require_approval: "never" as const,
    allowed_tools: [...AI_ACT_TOOL_NAMES],
  };
}
