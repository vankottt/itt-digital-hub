import { z } from "zod";
import { isLocale, type Locale } from "@/lib/i18n";

export const contactFieldLimits = {
  name: 120,
  company: 120,
  phone: 40,
  problem: 2000,
} as const;

const contactSchema = z.object({
  name: z.string().trim().min(1).max(contactFieldLimits.name),
  company: z.string().trim().max(contactFieldLimits.company),
  phone: z.string().trim().max(contactFieldLimits.phone),
  problem: z.string().trim().min(1).max(contactFieldLimits.problem),
  locale: z.string().refine((value): value is Locale => isLocale(value)),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export type ContactParseResult =
  | { kind: "spam" }
  | { kind: "invalid" }
  | { kind: "ok"; data: ContactPayload };

export function parseContactForm(form: FormData): ContactParseResult {
  const honeypot = String(form.get("website") ?? "").trim();
  if (honeypot) return { kind: "spam" };

  const parsed = contactSchema.safeParse({
    name: String(form.get("name") ?? ""),
    company: String(form.get("company") ?? ""),
    phone: String(form.get("phone") ?? ""),
    problem: String(form.get("problem") ?? ""),
    locale: String(form.get("locale") ?? ""),
  });

  if (!parsed.success) return { kind: "invalid" };
  return { kind: "ok", data: parsed.data };
}

export function formatContactMessage(data: ContactPayload): string {
  const lines = [
    `Name: ${data.name}`,
    `Company: ${data.company || "—"}`,
    `Phone: ${data.phone || "—"}`,
    `Locale: ${data.locale}`,
    "",
    data.problem,
  ];
  return lines.join("\n");
}
