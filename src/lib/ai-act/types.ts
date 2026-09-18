import type { Locale } from "@/lib/i18n";

export const AI_ACT_JOURNEYS = ["use", "build"] as const;
export type AiActJourney = (typeof AI_ACT_JOURNEYS)[number];

export const ANONYMOUS_QUESTION_LIMIT = 2;
export const AI_ACT_MESSAGE_MAX_LENGTH = 4000;

export const AI_ACT_SESSION_STORAGE_KEY = "itt-ai-act-session-v1";

export type ChatRole = "user" | "assistant";

export type ChatTurnStatus = "complete" | "pending" | "error";

export interface ChatTurn {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatTurnStatus;
  errorCode?: AiActErrorCode;
}

export interface ConversationEvent {
  type: string;
  at: string;
}

export interface AiActSession {
  anonymousSessionId: string;
  source?: string;
  campaign?: string;
  journey?: AiActJourney;
  name?: string;
  workEmail?: string;
  company?: string;
  role?: string;
  marketingConsent: boolean;
  questionsAsked: number;
  conversationEvents: ConversationEvent[];
  topics: string[];
  kitDownloadRequested: boolean;
  kitDownloaded: boolean;
  buildStep?: string;
  ctaInteractions: string[];
  leadCaptured: boolean;
  messages: ChatTurn[];
  locale?: Locale;
}

export interface AiActLeadInput {
  name: string;
  workEmail: string;
  company: string;
  role: string;
  marketingConsent: boolean;
  locale: Locale;
  anonymousSessionId: string;
  journey?: AiActJourney;
  source?: string;
  campaign?: string;
}

export const AI_ACT_ERROR_CODES = [
  "not_configured",
  "not_implemented",
  "rate_limited",
  "provider_error",
  "invalid",
  "lead_required",
  "kit_not_ready",
] as const;

export type AiActErrorCode = (typeof AI_ACT_ERROR_CODES)[number];

export interface AiActChatRequest {
  sessionId: string;
  locale: Locale;
  messages: Array<{ role: ChatRole; content: string }>;
}

export interface AiActChatSuccess {
  ok: true;
  message: { role: "assistant"; content: string };
  diagnostics?: { provider: string; model: string };
}

export interface AiActChatFailure {
  ok: false;
  error: { code: AiActErrorCode };
}

export type AiActChatResponse = AiActChatSuccess | AiActChatFailure;

export type AiProviderId = "google" | "openai";

export interface ProviderChatMessage {
  role: ChatRole;
  content: string;
}

export interface ProviderRequest {
  system: string;
  messages: ProviderChatMessage[];
  model: string;
}

export interface ProviderSuccess {
  text: string;
  provider: AiProviderId;
  model: string;
}

export interface AiProvider {
  id: AiProviderId;
  complete(request: ProviderRequest): Promise<ProviderSuccess>;
}

export interface KnowledgeContext {
  /** Provider-agnostic supplement. Empty until Goal 2 attaches the corpus. */
  systemSupplement: string;
}

export interface AiActConfig {
  provider: AiProviderId;
  model: string;
  googleKeyConfigured: boolean;
  openaiKeyConfigured: boolean;
}

export const AGENT_KIT_FILE_IDS = [
  "readme",
  "installer",
  "system",
  "config",
  "tests",
  "version",
  "sources",
] as const;

export type AgentKitFileId = (typeof AGENT_KIT_FILE_IDS)[number];

export interface AgentKitFile {
  id: AgentKitFileId;
  name: string;
  kind: "file" | "folder";
}
