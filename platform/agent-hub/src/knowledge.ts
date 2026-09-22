import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/;

export class KnowledgePathError extends Error {
  constructor() {
    super("Invalid knowledge file");
    this.name = "KnowledgePathError";
  }
}

export function agentsRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../agents");
}

export function knowledgeDirectory(agentId: string, directory: string): string {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(agentId) || !/^[a-z0-9][a-z0-9-]{0,32}$/.test(directory)) {
    throw new KnowledgePathError();
  }
  return path.resolve(agentsRoot(), agentId, directory);
}

export async function listLocalKnowledge(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isEnoent(error)) return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".txt")))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function readKnowledgeFile(directory: string, name: string): Promise<string> {
  if (!FILE_NAME.test(name)) throw new KnowledgePathError();
  const root = path.resolve(directory);
  const full = path.resolve(root, name);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new KnowledgePathError();
  return readFile(full, "utf8");
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
