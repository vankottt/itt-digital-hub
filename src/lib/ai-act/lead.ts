import { z } from "zod";
import { isLocale } from "@/lib/i18n";
import { AI_ACT_JOURNEYS, type AiActLeadInput } from "./types";

export const leadFieldLimits = {
  name: 120,
  workEmail: 180,
  company: 120,
  role: 120,
} as const;

/** Bulgarian typewriter layout, so an email typed with the wrong keyboard still validates. */
const BULGARIAN_KEYBOARD_TO_LATIN: Record<string, string> = {
  я: "q", в: "w", е: "e", р: "r", т: "t", ъ: "y", у: "u", и: "i", о: "o", п: "p", ч: "[",
  а: "a", с: "s", д: "d", ф: "f", г: "g", х: "h", й: "j", к: "k", л: "l",
  з: "z", ь: "x", ц: "c", ж: "v", б: "b", н: "n", м: "m",
  Я: "Q", В: "W", Е: "E", Р: "R", Т: "T", Ъ: "Y", У: "U", И: "I", О: "O", П: "P", Ч: "{",
  А: "A", С: "S", Д: "D", Ф: "F", Г: "G", Х: "H", Й: "J", К: "K", Л: "L",
  З: "Z", Ь: "X", Ц: "C", Ж: "V", Б: "B", Н: "N", М: "M",
};

export function normalizeWorkEmail(value: string): string {
  return value
    .trim()
    .replace(/[А-Яа-яЁё]/g, (letter) => BULGARIAN_KEYBOARD_TO_LATIN[letter] ?? letter);
}

const leadSchema = z.object({
  name: z.string().trim().min(1).max(leadFieldLimits.name),
  workEmail: z.string().trim().transform(normalizeWorkEmail).pipe(z.string().email().max(leadFieldLimits.workEmail)),
  company: z.string().trim().min(1).max(leadFieldLimits.company),
  role: z.string().trim().min(1).max(leadFieldLimits.role),
  marketingConsent: z.boolean(),
  locale: z.string().refine((value): value is AiActLeadInput["locale"] => isLocale(value)),
  anonymousSessionId: z.string().trim().min(8).max(80),
  journey: z.enum(AI_ACT_JOURNEYS).optional(),
  source: z.string().trim().max(80).optional(),
  campaign: z.string().trim().max(80).optional(),
});

export type LeadParseResult =
  | { kind: "spam" }
  | { kind: "invalid" }
  | { kind: "ok"; data: AiActLeadInput };

function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function parseLeadPayload(input: unknown): LeadParseResult {
  if (typeof input !== "object" || input === null) return { kind: "invalid" };
  const body = input as Record<string, unknown>;
  if (String(body.website ?? "").trim()) return { kind: "spam" };

  const parsed = leadSchema.safeParse({
    name: body.name,
    workEmail: body.workEmail,
    company: body.company,
    role: body.role,
    marketingConsent: asBoolean(body.marketingConsent),
    locale: body.locale,
    anonymousSessionId: body.anonymousSessionId,
    journey: body.journey || undefined,
    source: body.source || undefined,
    campaign: body.campaign || undefined,
  });

  if (!parsed.success) return { kind: "invalid" };
  return { kind: "ok", data: parsed.data };
}

export function leadFromForm(form: FormData): LeadParseResult {
  return parseLeadPayload({
    website: form.get("website"),
    name: String(form.get("name") ?? ""),
    workEmail: String(form.get("workEmail") ?? ""),
    company: String(form.get("company") ?? ""),
    role: String(form.get("role") ?? ""),
    marketingConsent: form.get("marketingConsent"),
    locale: String(form.get("locale") ?? ""),
    anonymousSessionId: String(form.get("anonymousSessionId") ?? ""),
    journey: String(form.get("journey") ?? ""),
    source: String(form.get("source") ?? ""),
    campaign: String(form.get("campaign") ?? ""),
  });
}
