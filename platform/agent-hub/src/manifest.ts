import { readFileSync } from "node:fs";
import { MAX_MESSAGE_CHARS } from "../../shared/src/index";
import type { AgentManifest } from "./agent";
import { MODEL_PROVIDER_IDS, type ModelProviderId } from "./providers/types";

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const DIRECTORY_PATTERN = /^[a-z0-9][a-z0-9-]{0,32}$/;
const TOOL_NAME_PATTERN = /^[a-z][a-z0-9._-]{0,63}$/;

export function readManifest(fileUrl: URL): AgentManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(fileUrl, "utf8")) as unknown;
  } catch {
    throw new Error("Invalid agent manifest");
  }
  return parseManifest(parsed);
}

export function parseManifest(value: unknown): AgentManifest {
  if (!isRecord(value)) throw new Error("Invalid agent manifest");
  const id = requiredString(value.id);
  if (!ID_PATTERN.test(id)) throw new Error("Invalid agent manifest");
  const name = requiredString(value.name);
  if (name.length < 1 || name.length > 80) invalid(id);
  const version = requiredString(value.version);
  if (!VERSION_PATTERN.test(version)) invalid(id);
  if (typeof value.enabled !== "boolean") invalid(id);
  const locales = parseLocales(value.locales);
  if (!locales) invalid(id);
  if (value.visibility !== "public" && value.visibility !== "internal") invalid(id);
  const modelPolicy = parseModelPolicy(value.modelPolicy);
  if (modelPolicy === null) invalid(id);
  const tools = parseTools(value.tools);
  if (!tools) invalid(id);
  const knowledge = parseKnowledge(value.knowledge);
  if (knowledge === null) invalid(id);
  const limits = parseLimits(value.limits);
  if (limits === null) invalid(id);
  const logging = parseLogging(value.logging);
  if (!logging) invalid(id);

  return {
    id,
    name,
    version,
    enabled: value.enabled,
    locales,
    visibility: value.visibility,
    ...(modelPolicy ? { modelPolicy } : {}),
    tools,
    ...(knowledge ? { knowledge } : {}),
    ...(limits ? { limits } : {}),
    logging,
  };
}

function parseLocales(value: unknown): Array<"bg" | "en"> | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 2) return null;
  const locales: Array<"bg" | "en"> = [];
  for (const item of value) {
    if (item !== "bg" && item !== "en") return null;
    if (locales.includes(item)) return null;
    locales.push(item);
  }
  return locales;
}

function parseModelPolicy(value: unknown): AgentManifest["modelPolicy"] | null | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;
  if (!isProviderId(value.provider)) return null;
  if (!isModelName(value.model)) return null;
  const fallback = parseFallback(value.fallback);
  if (fallback === null) return null;
  return {
    provider: value.provider,
    ...(typeof value.model === "string" ? { model: value.model } : {}),
    ...(fallback ? { fallback } : {}),
  };
}

function parseFallback(value: unknown): NonNullable<AgentManifest["modelPolicy"]>["fallback"] | null | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || !isProviderId(value.provider) || !isModelName(value.model)) return null;
  return {
    provider: value.provider,
    ...(typeof value.model === "string" ? { model: value.model } : {}),
  };
}

function isModelName(value: unknown): boolean {
  if (value === undefined) return true;
  return typeof value === "string" && value.length >= 1 && value.length <= 80;
}

function parseTools(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > 32) return null;
  const names: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !TOOL_NAME_PATTERN.test(item) || names.includes(item)) return null;
    names.push(item);
  }
  return names;
}

function parseKnowledge(value: unknown): AgentManifest["knowledge"] | null | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || typeof value.directory !== "string" || !DIRECTORY_PATTERN.test(value.directory)) return null;
  return { directory: value.directory };
}

function parseLimits(value: unknown): AgentManifest["limits"] | null | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;
  if (value.maxMessageChars === undefined) return {};
  if (
    typeof value.maxMessageChars !== "number" ||
    !Number.isInteger(value.maxMessageChars) ||
    value.maxMessageChars < 1 ||
    value.maxMessageChars > MAX_MESSAGE_CHARS
  ) {
    return null;
  }
  return { maxMessageChars: value.maxMessageChars };
}

function parseLogging(value: unknown): AgentManifest["logging"] | null {
  if (!isRecord(value)) return null;
  if (value.conversation !== "none" && value.conversation !== "metadata") return null;
  return { conversation: value.conversation };
}

function isProviderId(value: unknown): value is ModelProviderId {
  return typeof value === "string" && (MODEL_PROVIDER_IDS as readonly string[]).includes(value);
}

function requiredString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function invalid(id: string): never {
  throw new Error(`Invalid agent manifest: ${id}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
