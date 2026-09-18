import type { Locale } from "@/lib/i18n";
import type { KnowledgeContext } from "./types";

/**
 * Knowledge stays separable from Google Gemini and OpenAI.
 * Goal 2 attaches the AI Act corpus here. Goal 1 does not build a vector store.
 */
export function loadKnowledgeContext(locale: Locale): KnowledgeContext {
  void locale;
  return { systemSupplement: "" };
}

/** Goal 2 replaces this with SYSTEM_PROMPT.md. Empty so Goal 1 cannot invent legal answers. */
export function loadSystemInstructions(locale: Locale): string {
  void locale;
  return "";
}
