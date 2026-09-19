import type { Locale } from "@/lib/i18n";
import type { KnowledgeContext } from "./types";
import { loadSourceFiles, readKitFile } from "./kit-files";

const localeDirective: Record<Locale, string> = {
  bg: "Отговаряй на български, освен ако потребителят пише на друг език.",
  en: "Answer in English unless the user writes in another language.",
};

export function loadSystemInstructions(locale: Locale): string {
  return [localeDirective[locale], readKitFile("SYSTEM_PROMPT.md"), readKitFile("AGENT_CONFIG.md")].join("\n\n");
}

export function loadKnowledgeContext(locale: Locale): KnowledgeContext {
  void locale;
  const sources = loadSourceFiles();
  const systemSupplement = [
    "Trusted knowledge pack. Use only these sources for legal statements.",
    ...sources.map((file) => `## ${file.path}\n\n${file.content}`),
  ].join("\n\n");
  return { systemSupplement };
}
