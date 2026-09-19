import type { Locale } from "@/lib/i18n";
import { loadKitTree, readKitFile } from "./kit-files";
import { AGENT_KIT_REQUIRED_PATHS } from "./kit-manifest";
import { buildZip } from "./zip";

export { AGENT_KIT_FILES, AGENT_KIT_REQUIRED_PATHS } from "./kit-manifest";

export function extractLocaleSection(markdown: string, locale: Locale): string {
  const bg = markdown.split("<!--itt-locale:bg-->")[1]?.split("<!--itt-locale:en-->")[0]?.trim();
  const en = markdown.split("<!--itt-locale:en-->")[1]?.trim();
  if (locale === "en") return en || bg || markdown.trim();
  return bg || markdown.trim();
}

export function getInstallerPrompt(locale: Locale): string {
  return extractLocaleSection(readKitFile("INSTALLER_PROMPT.md"), locale);
}

export function getPrimaryTestCase(locale: Locale): { question: string; criteria: string[] } {
  const markdown = readKitFile("TEST_CASES.md");
  const block = markdown.split("## Case 1")[1] ?? markdown;
  const fences = [...block.matchAll(/```([\s\S]*?)```/g)].map((match) => match[1]?.trim() ?? "");
  const question = (locale === "en" ? fences[1] : fences[0]) || fences[0] || "";
  const rest = block.split("**Evaluation criteria**")[1] ?? "";
  const criteriaBlock = extractLocaleSection(rest.split(/^## /m)[0] ?? rest, locale);
  const criteria = criteriaBlock
    .split("\n")
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("---") && !line.startsWith("<!--"));
  return { question, criteria };
}

export function buildAgentKitZip(): Buffer {
  const files = loadKitTree();
  const missing = AGENT_KIT_REQUIRED_PATHS.filter((name) => !files.some((file) => file.path === name));
  const sourceCount = files.filter((file) => file.path.startsWith("sources/") && file.path !== "sources/").length;
  if (missing.length > 0 || sourceCount === 0) {
    throw new Error(`Agent kit is incomplete: missing ${missing.join(", ") || "sources"}`);
  }
  return buildZip(files.map((file) => ({ name: file.path, data: Buffer.from(file.content, "utf8") })));
}
