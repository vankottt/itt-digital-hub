import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { AiActChunk, AiActDocument, CorpusIndex, SourceKind } from "./types";

const ROOTS = ["regulation", "engineering", "interpretation"] as const;

let cached: CorpusIndex | null = null;

export function knowledgeRoot(cwd = process.cwd()): string {
  return path.join(cwd, "src/ai-act/knowledge");
}

export function resetCorpusCache(): void {
  cached = null;
}

export function getCorpus(cwd = process.cwd()): CorpusIndex {
  if (!cached) cached = buildCorpus(cwd);
  return cached;
}

export function buildCorpus(cwd = process.cwd()): CorpusIndex {
  const documents: AiActDocument[] = [];
  const chunks: AiActChunk[] = [];
  const root = knowledgeRoot(cwd);
  for (const folder of ROOTS) {
    const dir = path.join(root, folder);
    for (const filename of readdirSync(dir).filter((name) => name.endsWith(".md")).sort((a, b) => a.localeCompare(b, "en"))) {
      addFile(documents, chunks, path.join(dir, filename), filename);
    }
  }
  addFile(
    documents,
    chunks,
    path.join(cwd, "src/content/ai-act-kit/sources/06-commission-ai-literacy-qa.md"),
    "06-commission-ai-literacy-qa.md",
    "guidance",
  );
  markDuplicates(chunks);
  return { documents, chunks, byId: new Map(chunks.map((chunk) => [chunk.referenceId, chunk])) };
}

function addFile(
  documents: AiActDocument[],
  chunks: AiActChunk[],
  file: string,
  filename: string,
  forcedKind?: SourceKind,
): void {
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const kind = forcedKind ?? kindOf(data.kind) ?? "law";
  const documentId = filename.replace(/\.md$/, "");
  const article = data.article?.trim() || null;
  const annex = data.annex?.trim() || null;
  const heading = data.heading?.trim() || filename;
  const document: AiActDocument = {
    documentId,
    filename,
    title: documentTitle(kind, article, annex, heading),
    authority: data.authority === "european-commission" || kind === "guidance" ? "european-commission" : data.authority === "itt" || kind !== "law" ? "itt" : "eur-lex",
    instrument: kind === "law" ? "Регламент (ЕС) 2024/1689" : kind === "guidance" ? "Commission AI literacy Q&A" : "ITT Digital Hub",
    version: data.version?.trim() || (kind === "guidance" ? "selected Commission Q&A" : "2026-09-26"),
    url:
      data.url?.trim() ||
      (kind === "guidance"
        ? "https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers"
        : kind === "law"
          ? "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27"
          : ""),
    completeness: kind === "law" ? "consolidated" : "context",
    missingNote: kind === "law" ? "" : "Този запис не е текст на регламента.",
    kind,
  };
  documents.push(document);
  const sections = splitSections(body);
  sections.forEach((section, index) => {
    const point = /^\d+$/.test(section.heading) ? section.heading : null;
    const sectionArticle = article || articleFromHeading(section.heading);
    const text = section.text.trim();
    if (!text) return;
    chunks.push({
      referenceId: `aia_${documentId.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}_p${index + 1}`,
      documentId,
      article: sectionArticle,
      annex,
      point,
      heading: point ? `${document.title}, точка ${point}` : section.heading || heading,
      kind,
      text,
      searchText: `${section.heading}\n${text}`.toLowerCase(),
      contentHash: createHash("sha256").update(`${kind}\n${text}`).digest("hex"),
      duplicateOf: null,
    });
  });
}

function documentTitle(kind: SourceKind, article: string | null, annex: string | null, heading: string): string {
  if (kind === "law" && article) return `Регламент (ЕС) 2024/1689, член ${article}`;
  if (kind === "law" && annex) return `Регламент (ЕС) 2024/1689, приложение ${annex}`;
  if (kind === "guidance") return "European Commission, AI literacy questions and answers (selected)";
  if (kind === "engineering") return "Професионален контекст за инженерна и проектантска работа";
  return heading;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const block = match?.[1];
  if (!match || !block) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const split = line.indexOf(":");
    if (split === -1) continue;
    data[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  return { data, body: raw.slice(match[0].length) };
}

function splitSections(body: string): Array<{ heading: string; text: string }> {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const sections: Array<{ heading: string; text: string[] }> = [];
  let current: { heading: string; text: string[] } | null = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current && current.text.join("\n").trim()) sections.push(current);
      current = { heading: line.slice(3).trim(), text: [] };
    } else if (current) current.text.push(line);
  }
  if (current && current.text.join("\n").trim()) sections.push(current);
  if (sections.length === 0 && body.trim()) return [{ heading: "", text: body.trim() }];
  return sections.map((section) => ({ heading: section.heading, text: section.text.join("\n").trim() }));
}

function articleFromHeading(heading: string): string | null {
  const match = heading.match(/\b(?:Article|Член|чл\.)\s*(\d{1,4})\s*([а-яa-z])?/i);
  if (!match) return null;
  return `${match[1]}${suffix(match[2])}`;
}

function suffix(letter: string | undefined): string {
  if (!letter) return "";
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", a: "a", b: "b" };
  return map[letter.toLowerCase()] ?? "";
}

function kindOf(value: string | undefined): SourceKind | null {
  if (value === "law" || value === "guidance" || value === "engineering" || value === "interpretation") return value;
  return null;
}

function markDuplicates(chunks: AiActChunk[]): void {
  const seen = new Map<string, string>();
  for (const chunk of chunks) {
    const first = seen.get(chunk.contentHash);
    if (first && first !== chunk.referenceId) chunk.duplicateOf = first;
    else seen.set(chunk.contentHash, chunk.referenceId);
  }
}
