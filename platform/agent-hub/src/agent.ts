import type { ChatTurn, ClientState, ErrorCode, Locale } from "../../shared/src/index";
import type { ModelProviderId, ModelRouter } from "./providers/types";
import type { ToolRegistry } from "./tools/types";

export interface AgentManifest {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  locales: Locale[];
  visibility: "public" | "internal";
  modelPolicy?: {
    provider: ModelProviderId;
    model?: string;
    fallback?: {
      provider: ModelProviderId;
      model?: string;
    };
  };
  tools: string[];
  knowledge?: {
    directory: string;
  };
  limits?: {
    maxMessageChars?: number;
  };
  logging: {
    conversation: "none" | "metadata";
  };
}

export interface AgentRequest {
  sessionId: string;
  locale: Locale;
  message: string;
  history: ChatTurn[];
  clientState?: ClientState;
}

export interface AgentResponse {
  answer: string;
  state?: ClientState;
}

export interface AgentActionRequest {
  actionId: string;
  sessionId?: string;
  locale: Locale;
  input: Record<string, unknown>;
  clientState?: ClientState;
}

export interface AgentActionResponse {
  result: ClientState;
  state?: ClientState;
}

export class AgentHandledError extends Error {
  readonly code: ErrorCode;
  readonly providerStatus?: number;

  constructor(code: ErrorCode, providerStatus?: number) {
    super(code);
    this.name = "AgentHandledError";
    this.code = code;
    this.providerStatus = providerStatus;
  }
}

export interface AgentContext {
  requestId: string;
  signal: AbortSignal;
  models: ModelRouter;
  tools: ToolRegistry;
  knowledgeDir: string | null;
  now: () => Date;
}

export interface Agent {
  manifest: AgentManifest;
  handle(request: AgentRequest, context: AgentContext): Promise<AgentResponse>;
  act?(actionId: string, request: AgentActionRequest, context: AgentContext): Promise<AgentActionResponse>;
}
