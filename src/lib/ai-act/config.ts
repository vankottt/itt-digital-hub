import { z } from "zod";
import type { EnvMap } from "@/lib/env-runtime";
import { envOf } from "@/lib/env-runtime";
import type { AiActConfig, AiProviderId } from "./types";

const providerSchema = z.enum(["google", "openai"]);

function parseProvider(value: string | undefined): AiProviderId {
  const parsed = providerSchema.safeParse((value ?? "google").trim().toLowerCase());
  return parsed.success ? parsed.data : "google";
}

/** Server-only. Never expose keys to the client. */
export function readAiActConfig(env: EnvMap = envOf()): AiActConfig {
  const provider = parseProvider(env.AI_PROVIDER);
  const model = env.AI_MODEL?.trim() || (provider === "openai" ? "gpt-4.1-mini" : "gemini-3.8-flash");
  return {
    provider,
    model,
    timeoutMs: Math.min(25_000, Math.max(5_000, Number(env.AI_TIMEOUT_MS) || 20_000)),
    googleKeyConfigured: Boolean(env.GOOGLE_AI_API_KEY?.trim() || env.GEMINI_API_KEY?.trim()),
    openaiKeyConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
  };
}

export function providerKeyConfigured(config: AiActConfig): boolean {
  return config.provider === "google" ? config.googleKeyConfigured : config.openaiKeyConfigured;
}

export function googleApiKey(env: EnvMap = envOf()): string | undefined {
  const key = env.GOOGLE_AI_API_KEY?.trim() || env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function openaiApiKey(env: EnvMap = envOf()): string | undefined {
  const key = env.OPENAI_API_KEY?.trim();
  return key || undefined;
}
