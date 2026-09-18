import { z } from "zod";
import { isLocale } from "@/lib/i18n";
import { AI_ACT_MESSAGE_MAX_LENGTH, type AiActChatRequest } from "./types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(AI_ACT_MESSAGE_MAX_LENGTH),
});

const requestSchema = z.object({
  sessionId: z.string().trim().min(8).max(80),
  locale: z.string().refine((value): value is AiActChatRequest["locale"] => isLocale(value)),
  messages: z.array(messageSchema).min(1).max(40),
});

export type ChatRequestParseResult =
  | { kind: "invalid" }
  | { kind: "ok"; data: AiActChatRequest };

export function parseChatRequest(input: unknown): ChatRequestParseResult {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  return { kind: "ok", data: parsed.data };
}
