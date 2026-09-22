import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loadHubEnvFile(env: NodeJS.ProcessEnv = process.env): void {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  applyEnvFile(path.resolve(dir, "../.env"), env);
  applyEnvFile(path.resolve(dir, "../../../.env.local"), env);
}

function applyEnvFile(file: string, env: NodeJS.ProcessEnv): void {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    if (isEnoent(error)) return;
    throw error;
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!/^[A-Z0-9_]+$/.test(key) || env[key] !== undefined) continue;
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
