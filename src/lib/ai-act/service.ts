import type { Locale } from "@/lib/i18n";
import { readAiActConfig } from "./config";
import { AiActProviderError } from "./errors";
import { loadKnowledgeContext, loadSystemInstructions } from "./knowledge";
import { googleProvider } from "./providers/google";
import { openaiProvider } from "./providers/openai";
import type { AiProvider, ProviderChatMessage, ProviderRequest, ProviderSuccess } from "./types";

function providerFor(id: ReturnType<typeof readAiActConfig>["provider"]): AiProvider {
  return id === "openai" ? openaiProvider : googleProvider;
}

export async function completeAiActChat(input: {
  locale: Locale;
  messages: ProviderChatMessage[];
}): Promise<ProviderSuccess> {
  if (input.messages.length === 0) {
    throw new AiActProviderError("invalid", "messages are required");
  }

  const config = readAiActConfig();
  const provider = providerFor(config.provider);
  const knowledge = loadKnowledgeContext(input.locale);
  const system = [loadSystemInstructions(input.locale), knowledge.systemSupplement].filter(Boolean).join("\n\n");

  const request: ProviderRequest = {
    system,
    messages: input.messages,
    model: config.model,
  };

  return provider.complete(request);
}
