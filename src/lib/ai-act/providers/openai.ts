import type { AiProvider } from "../types";
import { AiActProviderError } from "../errors";

/**
 * OpenAI API. Same Chat UI, service, knowledge and lead logic as Google.
 * Goal 2 implements complete() when OPENAI_API_KEY is selected via AI_PROVIDER.
 */
export const openaiProvider: AiProvider = {
  id: "openai",
  async complete() {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      throw new AiActProviderError("not_configured", "OPENAI_API_KEY is not set", "openai");
    }
    throw new AiActProviderError("not_implemented", "OpenAI provider will be connected in Goal 2", "openai");
  },
};
