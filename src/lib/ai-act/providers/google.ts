import { googleApiKey } from "../config";
import { AiActProviderError } from "../errors";
import { providerFetch } from "./http";
import type { AiProvider, ProviderChatMessage, ProviderRequest, ProviderSuccess } from "../types";

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

function toGeminiContents(messages: ProviderChatMessage[]): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function extractText(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export const googleProvider: AiProvider = {
  id: "google",
  async complete(request: ProviderRequest): Promise<ProviderSuccess> {
    const key = googleApiKey();
    if (!key) {
      throw new AiActProviderError("not_configured", "GOOGLE_AI_API_KEY is not set", "google");
    }

    const model = request.model.replace(/^models\//, "");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    };
    const contents = toGeminiContents(request.messages);
    const systemInstruction = { parts: [{ text: request.system }] };

    async function generate(includeThinking: boolean): Promise<Response> {
      return providerFetch(
        url,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            system_instruction: systemInstruction,
            contents,
            ...(includeThinking ? { generationConfig: { thinkingConfig: { thinkingLevel: "low" } } } : {}),
          }),
        },
        request.timeoutMs,
      );
    }

    let response = await generate(true);
    if (response.status === 400) {
      response = await generate(false);
    }
    if (response.status === 500 || response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      response = await generate(false);
    }

    let payload: GeminiResponse = {};
    try {
      payload = (await response.json()) as GeminiResponse;
    } catch {
      payload = {};
    }

    if (response.status === 401 || response.status === 403) {
      throw new AiActProviderError("not_configured", "Google API rejected the key", "google");
    }
    if (
      response.status === 429 ||
      response.status === 503 ||
      payload.error?.status === "RESOURCE_EXHAUSTED" ||
      payload.error?.status === "UNAVAILABLE"
    ) {
      throw new AiActProviderError("rate_limited", "Google API rate limited", "google");
    }
    if (!response.ok) {
      console.error("[ai-act] google provider", response.status, payload.error?.status ?? "");
      throw new AiActProviderError("provider_error", "Google API request failed", "google");
    }

    if (payload.promptFeedback?.blockReason) {
      throw new AiActProviderError("provider_error", "Google API blocked the prompt", "google");
    }

    const text = extractText(payload);
    if (!text) {
      throw new AiActProviderError("provider_error", "Google API returned no text", "google");
    }

    return { text, provider: "google", model };
  },
};
