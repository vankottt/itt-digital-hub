import { ProviderNotEnabledError } from "./errors";
import type { ModelProvider, ModelProviderId } from "./types";

export function createLocalProvider(): ModelProvider {
  return {
    id: "local",
    async complete() {
      throw new ProviderNotEnabledError("local", false);
    },
  };
}

export function createGeminiProvider(env?: { GEMINI_API_KEY?: string }): ModelProvider {
  const key = env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
  return disabledProvider("gemini", Boolean(key?.trim()));
}

export function createOpenaiProvider(env?: { OPENAI_API_KEY?: string }): ModelProvider {
  const key = env?.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  return disabledProvider("openai", Boolean(key?.trim()));
}

function disabledProvider(id: ModelProviderId, keyConfigured: boolean): ModelProvider {
  return {
    id,
    async complete() {
      throw new ProviderNotEnabledError(id, keyConfigured);
    },
  };
}
