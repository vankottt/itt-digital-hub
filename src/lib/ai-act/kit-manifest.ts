import type { AgentKitFile } from "@/lib/ai-act/types";

export const AGENT_KIT_FILES: readonly AgentKitFile[] = [
  { id: "readme", name: "README.md", kind: "file" },
  { id: "installer", name: "INSTALLER_PROMPT.md", kind: "file" },
  { id: "system", name: "SYSTEM_PROMPT.md", kind: "file" },
  { id: "config", name: "AGENT_CONFIG.md", kind: "file" },
  { id: "tests", name: "TEST_CASES.md", kind: "file" },
  { id: "version", name: "VERSION.md", kind: "file" },
  { id: "sources", name: "sources/", kind: "folder" },
] as const;

export const AGENT_KIT_REQUIRED_PATHS = [
  "README.md",
  "INSTALLER_PROMPT.md",
  "SYSTEM_PROMPT.md",
  "AGENT_CONFIG.md",
  "TEST_CASES.md",
  "VERSION.md",
] as const;
