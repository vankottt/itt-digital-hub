import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { AiActChunk, AiActDocument, CorpusIndex, SourceKind } from "./types";

const CATALOG: Record<string, Omit<AiActDocument, "documentId" | "filename">> = {
  "01-scope-and-roles.md": {
    title: "Regulation (EU) 2024/1689, Articles 2 and 3 (extract)",
    authority: "eur-lex",
    instrument: "Regulation (EU) 2024/1689",
    version: "consolidated 27 July 2026",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27",
    completeness: "extract",
    missingNote:
      "Extract of Articles 2 and 3 only. Importer, distributor and authorised representative definitions are not in this file.",
  },
  "02-article-4-ai-literacy.md": {
    title: "Regulation (EU) 2024/1689, Articles 3(56) and 4 (extract)",
    authority: "eur-lex",
    instrument: "Regulation (EU) 2024/1689",
    version: "consolidated 27 July 2026",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27",
    completeness: "extract",
    missingNote: "Extract of the AI literacy definition and Article 4. It is not the full regulation.",
  },
  "03-risk-classification.md": {
    title: "Regulation (EU) 2024/1689, Articles 5, 6 and 26 (extract)",
    authority: "eur-lex",
    instrument: "Regulation (EU) 2024/1689",
    version: "consolidated 27 July 2026",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27",
    completeness: "extract",
    missingNote: "Screening extract. Annex III is not reproduced, and Article 5 exceptions are not complete.",
  },
  "04-transparency.md": {
    title: "Regulation (EU) 2024/1689, Article 50 (extract)",
    authority: "eur-lex",
    instrument: "Regulation (EU) 2024/1689",
    version: "consolidated 27 July 2026",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27",
    completeness: "extract",
    missingNote: "Extract of Article 50. It is not the full transparency chapter.",
  },
  "05-application-timeline.md": {
    title: "Regulation (EU) 2024/1689, Article 113 (extract)",
    authority: "eur-lex",
    instrument: "Regulation (EU) 2024/1689",
    version: "consolidated 27 July 2026",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27",
    completeness: "extract",
    missingNote: "Extract of Article 113 dates of application as consolidated on 27 July 2026.",
  },
  "06-commission-ai-literacy-qa.md": {
    title: "European Commission, AI literacy questions and answers (selected)",
    authority: "european-commission",
    instrument: "Commission AI literacy Q&A",
    version: "selected Commission Q&A",
    url: "https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers",
    completeness: "extract",
    missingNote: "Selected official Q&A. It is guidance, not the regulation, and may use older wording than the consolidated Article 4.",
  },
};

let cached: CorpusIndex | null = null;

export function knowledgeDir(cwd = process.cwd()): string {
  return path.join(cwd, "src/content/ai-act-kit/sources");
}

export function resetCorpusCache(): void {
  cached = null;
}

export function getCorpus(cwd = process.cwd()): CorpusIndex {
  if (!cached) cached = buildCorpus(cwd);
  return cached;
}

export function buildCorpus(cwd = process.cwd()): CorpusIndex {
  const dir = knowledgeDir(cwd);
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".md") && name !== "00-source-index.md")
    .sort((a, b) => a.localeCompare(b, "en"));
  const documents: AiActDocument[] = [];
  const chunks: AiActChunk[] = [];
  for (const filename of files) {
    const meta = CATALOG[filename];
    if (!meta) continue;
    const documentId = filename.replace(/\.md$/, "");
    const document: AiActDocument = { documentId, filename, ...meta };
    documents.push(document);
    const raw = readFileSync(path.join(dir, filename), "utf8");
    chunks.push(...chunkDocument(document, raw));
  }
  markDuplicates(chunks);
  return { documents, chunks, byId: new Map(chunks.map((chunk) => [chunk.referenceId, chunk])) };
}

function chunkDocument(document: AiActDocument, raw: string): AiActChunk[] {
  const sections = splitSections(raw);
  return sections.map((section, index) => {
    const article = articleFromHeading(section.heading);
    const point = pointFromHeading(section.heading);
    const kind = kindFor(document.filename, section.heading);
    const text = section.text.trim();
    return {
      referenceId: `aia_${document.documentId.replace(/^\d+-/, "").replace(/[^a-z0-9]+/g, "-")}_p${index + 1}`,
      documentId: document.documentId,
      article,
      point,
      heading: section.heading,
      kind,
      text,
      searchText: `${section.heading}\n${text}`.toLowerCase(),
      contentHash: createHash("sha256").update(text).digest("hex"),
      duplicateOf: null,
    };
  });
}

function splitSections(raw: string): Array<{ heading: string; text: string }> {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const sections: Array<{ heading: string; text: string[] }> = [];
  let current: { heading: string; text: string[] } | null = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current && current.text.join("\n").trim()) sections.push(current);
      current = { heading: line.slice(3).trim(), text: [] };
    } else if (current) current.text.push(line);
  }
  if (current && current.text.join("\n").trim()) sections.push(current);
  return sections.map((section) => ({ heading: section.heading, text: section.text.join("\n").trim() }));
}

function articleFromHeading(heading: string): string | null {
  const match = heading.match(/\b(?:Article|Член|чл\.)\s*(\d{1,4})\b/i);
  return match?.[1] ?? null;
}

function pointFromHeading(heading: string): string | null {
  const match = heading.match(/\bArticle\s+\d{1,4}\((\d{1,3})\)/i);
  return match?.[1] ?? null;
}

function kindFor(filename: string, heading: string): SourceKind {
  if (/ITT note|Practical reading|How to use this file|Reading for this assistant/i.test(heading)) return "interpretation";
  if (filename.startsWith("06-")) return "guidance";
  return "law";
}

function markDuplicates(chunks: AiActChunk[]): void {
  const seen = new Map<string, string>();
  for (const chunk of chunks) {
    const first = seen.get(chunk.contentHash);
    if (first && first !== chunk.referenceId) chunk.duplicateOf = first;
    else seen.set(chunk.contentHash, chunk.referenceId);
  }
}
