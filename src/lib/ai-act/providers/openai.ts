import { openaiApiKey } from "../config";
import { AiActProviderError } from "../errors";
import { providerFetch } from "./http";
import type { AiProvider, ProviderRequest, ProviderSuccess } from "../types";

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export const openaiProvider: AiProvider = {
  id: "openai",
  async complete(request: ProviderRequest): Promise<ProviderSuccess> {
    const key = openaiApiKey();
    if (!key) {
      throw new AiActProviderError("not_configured", "OPENAI_API_KEY is not set", "openai");
    }

    const response = await providerFetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: "system", content: request.system }, ...request.messages],
        }),
      },
      request.timeoutMs,
    );

    let payload: OpenAIResponse = {};
    try {
      payload = (await response.json()) as OpenAIResponse;
    } catch {
      payload = {};
    }

    if (response.status === 401 || response.status === 403) {
      throw new AiActProviderError("not_configured", "OpenAI API rejected the key", "openai");
    }
    if (response.status === 429) {
      throw new AiActProviderError("rate_limited", "OpenAI API rate limited", "openai");
    }
    if (!response.ok) {
      console.error("[ai-act] openai provider", response.status);
      throw new AiActProviderError("provider_error", "OpenAI API request failed", "openai");
    }

    const text = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      throw new AiActProviderError("provider_error", "OpenAI API returned no text", "openai");
    }

    return { text, provider: "openai", model: request.model };
  },
};
