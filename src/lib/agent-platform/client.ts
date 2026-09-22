import type { AiActErrorCode } from "@/lib/ai-act/types";

const DEFAULT_ORIGIN = "https://api.ittdigitalhub.org";

export interface AiActPlatformState {
  gate?: string;
  questionsAsked?: number;
  questionsRemaining?: number;
  leadCaptured?: boolean;
  leadRequired?: boolean;
}

export function agentGatewayOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_AGENT_GATEWAY_ORIGIN?.trim().replace(/\/$/, "");
  return configured || DEFAULT_ORIGIN;
}

export function mapPlatformError(code: string | undefined): AiActErrorCode {
  if (code === "RATE_LIMITED") return "rate_limited";
  if (code === "LEAD_REQUIRED") return "lead_required";
  if (code === "PROVIDER_TIMEOUT" || code === "UPSTREAM_TIMEOUT") return "timeout";
  if (code === "NOT_CONFIGURED" || code === "AGENT_DISABLED") return "not_configured";
  if (code === "INVALID_BODY" || code === "MESSAGE_TOO_LONG") return "invalid";
  if (code === "ORIGIN_NOT_ALLOWED") return "network";
  if (code === "PROVIDER_UNAVAILABLE" || code === "UPSTREAM_UNAVAILABLE") return "provider_error";
  return "provider_error";
}

export async function postAgent(path: string, body: unknown): Promise<Response> {
  return fetch(`${agentGatewayOrigin()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
