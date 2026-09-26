import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { CorpusAudit, CorpusIndex, VikChunk, VikDocument } from "./types";

const SUFFIX: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sht",
  ъ: "a",
  ь: "y",
  ю: "yu",
  я: "ya",
};

const ARTICLE_HEADING = /^#{1,6}\s+Чл\.\s*(\d+)\s*([а-я])?\.?\s*$/i;
const SECTION_HEADING = /^#{1,4}\s+(?!Чл\.)(.+)$/;
const MAX_CHUNK_CHARS = 1800;

let cached: CorpusIndex | null = null;

export function knowledgeRoot(cwd = process.cwd()): string {
  return path.join(cwd, "Tools/WSS - AI Asistant/Вик Асистен - Знание");
}

export function resetCorpusCache(): void {
  cached = null;
}

export function getCorpus(cwd = process.cwd()): CorpusIndex {
  if (!cached) cached = buildCorpus(cwd);
  return cached;
}

export function buildCorpus(cwd = process.cwd()): CorpusIndex {
  const root = knowledgeRoot(cwd);
  const knowledgeDir = path.join(root, "knowledge");
  const files = listMarkdown(knowledgeDir);
  const documents: VikDocument[] = [];
  const chunks: VikChunk[] = [];
  let totalBytes = 0;
  let replacementCharacters = 0;

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    totalBytes += Buffer.byteLength(raw);
    replacementCharacters += countChar(raw, "\uFFFD");
    const relative = path.relative(root, file).split(path.sep).join("/");
    const { data, body } = parseFrontmatter(raw);
    const document = toDocument(data, relative, file);
    documents.push(document);
    chunks.push(...chunkDocument(document, body));
  }

  markDuplicates(chunks);
  const byId = new Map(chunks.map((chunk) => [chunk.referenceId, chunk]));
  return {
    documents,
    chunks,
    byId,
    audit: auditCorpus(documents, chunks, files.length, totalBytes, replacementCharacters),
  };
}

function listMarkdown(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") found.push(full);
  }
  return found.sort((a, b) => a.localeCompare(b, "en"));
}

function toDocument(data: Record<string, unknown>, relative: string, file: string): VikDocument {
  const filename = path.basename(file, ".md");
  const documentId = slug(asString(data.id) || filename);
  const title = asString(data.title) || filename;
  return {
    documentId,
    title,
    shortTitle: title.length > 140 ? `${title.slice(0, 137)}…` : title,
    number: asString(data.number),
    year: asNumber(data.year),
    domains: asStringList(data.domain ?? data.domains),
    jurisdiction: asString(data.jurisdiction) || "BG",
    language: asString(data.language) || "bg",
    status: asString(data.status) || "unknown",
    dvReference: asString(data.dv_reference),
    effectiveDate: asString(data.effective_date),
    lastAmendment: asString(data.last_amendment),
    sourceInstitution: asString(data.source_institution),
    contentCurrency: asString(data.content_currency) || "unknown",
    contentCompleteness: asString(data.content_completeness) || "unknown",
    missingContentTypes: asStringList(data.missing_content_types),
    safeForTextual: data.safe_for_textual_rag !== false,
    safeForNumeric: data.safe_for_numeric_answer === true,
    requiresManualVerification: data.requires_manual_verification === true,
    priority: asString(data.priority) || "unknown",
    knowledgeFile: relative,
  };
}

function chunkDocument(document: VikDocument, body: string): VikChunk[] {
  const lines = body.split(/\r?\n/);
  const starts: Array<{ index: number; article: string | null; heading: string }> = [{ index: 0, article: null, heading: "Преамбюл" }];
  let section = "";
  const sectionAtLine: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const sectionMatch = line.match(SECTION_HEADING);
    if (sectionMatch?.[1]) section = sectionMatch[1].trim();
    sectionAtLine.push(section);
    const articleMatch = line.match(ARTICLE_HEADING);
    if (!articleMatch?.[1]) continue;
    const article = `${articleMatch[1]}${articleMatch[2] ?? ""}`;
    starts.push({ index, article, heading: line.replace(/^#+\s*/, "").trim() });
  }

  const chunks: VikChunk[] = [];
  for (let cursor = 0; cursor < starts.length; cursor += 1) {
    const start = starts[cursor];
    if (!start) continue;
    const end = starts[cursor + 1]?.index ?? lines.length;
    if (start.article === null && end === 0) continue;
    const text = lines.slice(start.index, end).join("\n").trim();
    if (text.length < 40 && start.article === null) continue;
    const section = sectionAtLine[start.index] ?? "";
    const parts = splitText(text);
    parts.forEach((part, partIndex) => {
      const articleSlug = start.article ? `a${articleToken(start.article)}` : "preamble";
      const referenceId = `vk1_${document.documentId}_${articleSlug}_p${partIndex}`;
      chunks.push({
        referenceId,
        documentId: document.documentId,
        article: start.article,
        articleSlug,
        part: partIndex,
        heading: start.heading,
        section,
        text: part,
        searchText: `${document.title}\n${document.number} ${document.year ?? ""}\n${section}\n${start.heading}\n${part}`,
        contentHash: createHash("sha256").update(normalize(part)).digest("hex"),
        duplicateOf: null,
      });
    });
  }
  return chunks;
}

function splitText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];
  const parts: string[] = [];
  let offset = 0;
  while (offset < text.length) {
    let end = Math.min(text.length, offset + MAX_CHUNK_CHARS);
    if (end < text.length) {
      const breakAt = text.lastIndexOf("\n", end);
      if (breakAt > offset + 400) end = breakAt;
    }
    parts.push(text.slice(offset, end).trim());
    if (end >= text.length) break;
    offset = Math.max(end - 180, offset + 1);
  }
  return parts.filter((part) => part.length > 0);
}

function markDuplicates(chunks: VikChunk[]): void {
  const first = new Map<string, string>();
  for (const chunk of chunks) {
    const prior = first.get(chunk.contentHash);
    if (!prior) {
      first.set(chunk.contentHash, chunk.referenceId);
      continue;
    }
    chunk.duplicateOf = prior;
  }
}

function auditCorpus(
  documents: VikDocument[],
  chunks: VikChunk[],
  knowledgeFiles: number,
  totalBytes: number,
  replacementCharacters: number,
): CorpusAudit {
  const groups = new Map<string, number>();
  let formulaMarkerChunks = 0;
  for (const chunk of chunks) {
    groups.set(chunk.contentHash, (groups.get(chunk.contentHash) ?? 0) + 1);
    if (/equation editor|неизвлечен/i.test(chunk.text)) formulaMarkerChunks += 1;
  }
  let duplicateChunkGroups = 0;
  let duplicateChunkCopies = 0;
  for (const count of groups.values()) {
    if (count > 1) {
      duplicateChunkGroups += 1;
      duplicateChunkCopies += count - 1;
    }
  }
  return {
    knowledgeFiles,
    formats: ["md"],
    totalBytes,
    documents: documents.length,
    chunks: chunks.length,
    uniqueChunks: chunks.length - duplicateChunkCopies,
    duplicateChunkGroups,
    duplicateChunkCopies,
    missingTitle: documents.filter((document) => !document.title.trim()).map((document) => document.documentId),
    replacementCharacters,
    formulaMarkerChunks,
    numericCautionDocuments: documents.filter((document) => !document.safeForNumeric).map((document) => document.documentId),
    manualVerificationDocuments: documents.filter((document) => document.requiresManualVerification).map((document) => document.documentId),
    domains: [...new Set(documents.flatMap((document) => document.domains))].sort(),
  };
}

export function articleToken(article: string): string {
  const match = article.match(/^(\d+)\s*([а-я])?$/i);
  if (!match?.[1]) return "x";
  const suffix = match[2] ? (SUFFIX[match[2].toLowerCase()] ?? "x") : "";
  return `${match[1]}${suffix}`;
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { data: {}, body: raw };
  return { data: parseSimpleYaml(raw.slice(4, end)), body: raw.slice(end + 4).replace(/^\r?\n/, "") };
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const lines = yaml.split(/\r?\n/);
  let listKey: string | null = null;
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      const list = data[listKey];
      if (Array.isArray(list)) list.push(unquote(item[1] ?? ""));
      continue;
    }
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!field?.[1]) continue;
    const key = field[1];
    const value = field[2] ?? "";
    if (!value.trim()) {
      data[key] = [];
      listKey = key;
      continue;
    }
    listKey = null;
    data[key] = coerce(unquote(value));
  }
  return data;
}

function coerce(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function countChar(value: string, needle: string): number {
  let count = 0;
  for (const char of value) if (char === needle) count += 1;
  return count;
}
