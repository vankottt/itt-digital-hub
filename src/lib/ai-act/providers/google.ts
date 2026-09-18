import type { AiProvider } from "../types";
import { AiActProviderError } from "../errors";

/**
 * Google Gemini via Gemini Developer API.
 * Goal 2 implements complete() against gemini-3.8-flash (or AI_MODEL).
 */
export const googleProvider: AiProvider = {
  id: "google",
  async complete() {
    const key = process.env.GOOGLE_AI_API_KEY?.trim();
    if (!key) {
      throw new AiActProviderError("not_configured", "GOOGLE_AI_API_KEY is not set", "google");
    }
    throw new AiActProviderError("not_implemented", "Google provider will be connected in Goal 2", "google");
  },
};
