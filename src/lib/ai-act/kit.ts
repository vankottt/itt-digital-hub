import type { AgentKitFile } from "@/lib/ai-act/types";
import { installerPrompt } from "@/content/ai-act-kit/installer-prompt";
import type { Locale } from "@/lib/i18n";

/** Package structure Goal 2 will zip. Do not invent legal source filenames here. */
export const AGENT_KIT_FILES: readonly AgentKitFile[] = [
  { id: "readme", name: "README.md", kind: "file" },
  { id: "installer", name: "INSTALLER_PROMPT.md", kind: "file" },
  { id: "system", name: "SYSTEM_PROMPT.md", kind: "file" },
  { id: "config", name: "AGENT_CONFIG.md", kind: "file" },
  { id: "tests", name: "TEST_CASES.md", kind: "file" },
  { id: "version", name: "VERSION.md", kind: "file" },
  { id: "sources", name: "sources/", kind: "folder" },
];

/** Single installer-prompt source for the UI. Goal 2 swaps this for the real kit file. */
export function getInstallerPrompt(locale: Locale): string {
  return installerPrompt[locale];
}
