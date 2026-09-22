export const MODEL_PROVIDER_IDS = ["mock", "local", "gemini", "openai", "openrouter"] as const;

export type ModelProviderId = (typeof MODEL_PROVIDER_IDS)[number];

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  /** Set only when the provider response includes a cost. Never estimated here. */
  cost?: number;
}

export interface ModelFallback {
  provider: ModelProviderId;
  model?: string;
}

export interface ModelCallMeta {
  requestId?: string;
  agentId?: string;
}

export interface ModelRequest {
  provider: ModelProviderId;
  model?: string;
  messages: ModelMessage[];
  signal?: AbortSignal;
  /** Tried only after a defined provider failure. Never used for a successful short or uncertain answer. */
  fallback?: ModelFallback;
  call?: ModelCallMeta;
}

export interface ModelResponse {
  text: string;
  provider: ModelProviderId;
  model: string;
  usage?: ModelUsage;
  /** Upstream inference provider, when the gateway exposes it as a short safe name. */
  upstreamProvider?: string;
  fallbackUsed?: boolean;
  durationMs?: number;
}

export interface ModelProvider {
  id: ModelProviderId;
  complete(request: ModelRequest): Promise<ModelResponse>;
}

export interface ModelRouter {
  complete(request: ModelRequest): Promise<ModelResponse>;
}
