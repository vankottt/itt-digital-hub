import { getCorpus } from "./corpus";
import type { CorpusIndex, SearchHit, VikChunk, VikDocument } from "./types";

const STOP = new Set([
  "и",
  "на",
  "за",
  "от",
  "в",
  "с",
  "се",
  "да",
  "не",
  "по",
  "до",
  "като",
  "или",
  "това",
  "при",
  "към",
  "the",
  "and",
  "for",
  "with",
]);

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 8;
const EXCERPT_CHARS = 700;

let statsCache: { corpus: CorpusIndex; size: number; df: Map<string, number> } | null = null;

export function searchKnowledge(input: {
  query: string;
  category?: string;
  source?: string;
  limit?: number;
}): { ok: true; results: SearchHit[] } | { ok: false; code: string; message: string } {
  const query = input.query.trim();
  if (query.length < 2) return { ok: false, code: "invalid_input", message: "Заявката е твърде кратка." };
  if (query.length > 400) return { ok: false, code: "invalid_input", message: "Заявката надвишава 400 знака." };
  const limit = input.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return { ok: false, code: "invalid_input", message: "limit трябва да е цяло число от 1 до 8." };
  }

  const corpus = getCorpus();
  const category = input.category?.trim();
  const source = input.source?.trim().toLowerCase();
  if (category && !corpus.audit.domains.includes(category)) {
    return { ok: false, code: "invalid_input", message: "Непозната категория." };
  }

  const documents = new Map(corpus.documents.map((document) => [document.documentId, document]));
  const queryTokens = tokens(query);
  const article = articleMention(query);
  const stats = corpusStats(corpus);
  const scored = corpus.chunks
    .filter((chunk) => chunk.duplicateOf === null)
    .filter((chunk) => (article ? chunk.article === article : true))
    .map((chunk) => {
      const document = documents.get(chunk.documentId);
      if (!document) return null;
      if (category && !document.domains.includes(category)) return null;
      if (source && !matchesSource(document, source)) return null;
      const score = scoreChunk(chunk, document, query, queryTokens, stats);
      return score > 0 ? { chunk, document, score } : null;
    })
    .filter((item): item is { chunk: VikChunk; document: VikDocument; score: number } => item !== null)
    .sort((a, b) => b.score - a.score || a.chunk.referenceId.localeCompare(b.chunk.referenceId));

  if (article && scored.length === 0) return { ok: true, results: [] };
  const collapsed = collapseArticles(scored);
  const top = collapsed[0]?.score ?? 0;
  if (!article && top < 3) return { ok: true, results: [] };

  return {
    ok: true,
    results: collapsed.slice(0, limit).map((item, index) => toHit(item.chunk, item.document, index + 1, queryTokens)),
  };
}

export function getReference(referenceId: string):
  | { ok: true; reference: ReturnType<typeof presentReference> }
  | { ok: false; code: string; message: string } {
  if (!isReferenceId(referenceId)) return { ok: false, code: "invalid_input", message: "Невалиден идентификатор на източник." };
  const corpus = getCorpus();
  const chunk = corpus.byId.get(referenceId);
  if (!chunk || chunk.duplicateOf) return { ok: false, code: "not_found", message: "Няма запис с този идентификатор." };
  const document = corpus.documents.find((item) => item.documentId === chunk.documentId);
  if (!document) return { ok: false, code: "not_found", message: "Няма запис с този идентификатор." };
  return { ok: true, reference: presentReference(corpus.chunks, chunk, document) };
}

export function listSources(): Array<{
  documentId: string;
  title: string;
  number: string;
  year: number | null;
  domains: string[];
  dvReference: string;
  contentCurrency: string;
  contentCompleteness: string;
  safeForTextual: boolean;
  safeForNumeric: boolean;
  requiresManualVerification: boolean;
  missingContentTypes: string[];
}> {
  return getCorpus().documents.map((document) => ({
    documentId: document.documentId,
    title: document.title,
    number: document.number,
    year: document.year,
    domains: document.domains,
    dvReference: document.dvReference,
    contentCurrency: document.contentCurrency,
    contentCompleteness: document.contentCompleteness,
    safeForTextual: document.safeForTextual,
    safeForNumeric: document.safeForNumeric,
    requiresManualVerification: document.requiresManualVerification,
    missingContentTypes: document.missingContentTypes,
  }));
}

export function isReferenceId(value: string): boolean {
  return /^vk1_[a-z0-9]+(?:-[a-z0-9]+)*_(?:a\d+[a-z]*|preamble)_p\d+$/.test(value);
}

function scoreChunk(
  chunk: VikChunk,
  document: VikDocument,
  query: string,
  queryTokens: string[],
  stats: { size: number; df: Map<string, number> },
): number {
  const docTokens = tokens(chunk.searchText);
  if (docTokens.length === 0 || queryTokens.length === 0) return 0;
  const frequencies = new Map<string, number>();
  for (const token of docTokens) frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  const querySet = new Set(queryTokens);
  let score = 0;
  let overlap = 0;
  for (const token of querySet) {
    const freq = frequencies.get(token) ?? 0;
    if (!freq) continue;
    overlap += 1;
    const idf = Math.log(1 + (stats.size - (stats.df.get(token) ?? 0) + 0.5) / ((stats.df.get(token) ?? 0) + 0.5));
    score += idf * ((freq * 1.2) / (freq + 1.2 * (1 - 0.75 + 0.75 * (docTokens.length / 180))));
  }
  score *= overlap / querySet.size;
  if (overlap / querySet.size < 0.45) score *= 0.25;
  const titleTokens = tokens(document.title);
  const titleOverlap = titleTokens.filter((token) => querySet.has(token)).length;
  if (titleTokens.length > 0) score += (titleOverlap / titleTokens.length) * 6;
  if (titleOverlap < 1 && overlap / querySet.size < 0.55) return 0;
  if (mentionsDocument(query, document)) score += 5;
  if (/обхват|урежда|предмет|scope/iu.test(query) && chunk.article === "1" && titleOverlap >= 2) score += 4;
  if (!chunk.article) score *= 0.45;
  return score;
}

function collapseArticles(
  scored: Array<{ chunk: VikChunk; document: VikDocument; score: number }>,
): Array<{ chunk: VikChunk; document: VikDocument; score: number }> {
  const best = new Map<string, { chunk: VikChunk; document: VikDocument; score: number }>();
  for (const item of scored) {
    const key = `${item.chunk.documentId}:${item.chunk.article ?? item.chunk.referenceId}`;
    const current = best.get(key);
    if (!current || item.score > current.score) best.set(key, item);
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.chunk.referenceId.localeCompare(b.chunk.referenceId));
}

function corpusStats(corpus: CorpusIndex): { size: number; df: Map<string, number> } {
  if (statsCache?.corpus === corpus) return statsCache;
  const df = new Map<string, number>();
  let size = 0;
  for (const chunk of corpus.chunks) {
    if (chunk.duplicateOf) continue;
    size += 1;
    for (const token of new Set(tokens(chunk.searchText))) df.set(token, (df.get(token) ?? 0) + 1);
  }
  statsCache = { corpus, size, df };
  return statsCache;
}

function mentionsDocument(query: string, document: VikDocument): boolean {
  const normalized = query.toLowerCase();
  const code = document.title.toLowerCase().match(/рд-\d{2}-\d{2}-\d+/);
  if (code && normalized.includes(code[0])) return true;
  if (!document.year || !normalized.includes(String(document.year))) return false;
  if (!document.number) return false;
  return new RegExp(`(^|[^0-9])${escapeRegExp(document.number)}([^0-9]|$)`).test(normalized);
}

function matchesSource(document: VikDocument, source: string): boolean {
  return (
    document.documentId.includes(source) ||
    document.title.toLowerCase().includes(source) ||
    document.number.toLowerCase() === source
  );
}

function toHit(chunk: VikChunk, document: VikDocument, rank: number, queryTokens: string[]): SearchHit {
  return {
    referenceId: chunk.referenceId,
    rank,
    documentId: document.documentId,
    title: document.title,
    number: document.number,
    year: document.year,
    dvReference: document.dvReference,
    contentCurrency: document.contentCurrency,
    domains: document.domains,
    section: chunk.section,
    heading: chunk.heading,
    article: chunk.article,
    excerpt: excerpt(chunk.text, queryTokens),
    safeForNumeric: document.safeForNumeric,
    contentCompleteness: document.contentCompleteness,
    missingContentTypes: document.missingContentTypes,
    requiresManualVerification: document.requiresManualVerification,
  };
}

function presentReference(chunks: VikChunk[], chunk: VikChunk, document: VikDocument) {
  const siblings = chunks.filter((item) => item.documentId === chunk.documentId && item.duplicateOf === null);
  const index = siblings.findIndex((item) => item.referenceId === chunk.referenceId);
  return {
    referenceId: chunk.referenceId,
    source: {
      documentId: document.documentId,
      title: document.title,
      number: document.number,
      year: document.year,
      dvReference: document.dvReference,
      contentCurrency: document.contentCurrency,
      sourceInstitution: document.sourceInstitution,
      status: document.status,
    },
    section: chunk.section,
    heading: chunk.heading,
    article: chunk.article,
    page: null,
    text: bound(chunk.text, 3500),
    surrounding: {
      before: index > 0 ? bound(siblings[index - 1]?.text ?? "", 500) : "",
      after: index >= 0 && index < siblings.length - 1 ? bound(siblings[index + 1]?.text ?? "", 500) : "",
    },
    safeForNumeric: document.safeForNumeric,
    contentCompleteness: document.contentCompleteness,
    missingContentTypes: document.missingContentTypes,
    requiresManualVerification: document.requiresManualVerification,
  };
}

function excerpt(text: string, queryTokens: string[]): string {
  const lower = text.toLowerCase();
  let at = -1;
  for (const token of queryTokens) {
    at = lower.indexOf(token);
    if (at >= 0) break;
  }
  if (at < 0) return bound(text, EXCERPT_CHARS);
  const start = Math.max(0, at - 180);
  return bound(text.slice(start), EXCERPT_CHARS);
}

function bound(text: string, max: number): string {
  const clean = text.replace(/\s+\n/g, "\n").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^0-9a-zа-я]+/iu)
    .map(stem)
    .filter((token) => (token.length >= 2 || /^\d$/.test(token)) && !STOP.has(token));
}

function stem(token: string): string {
  if (/^\d+$/.test(token)) return token;
  const suffixes = ["ите", "ата", "ята", "ото", "овете", "ове", "та", "то", "те", "ят", "а", "о", "е", "и", "я", "ъ"];
  for (const suffix of suffixes) {
    if (token.length - suffix.length >= 5 && token.endsWith(suffix)) return token.slice(0, -suffix.length);
  }
  return token;
}

function articleMention(query: string): string | null {
  const match = query.match(/чл\.?\s*(\d+)([а-я])?/iu);
  if (!match?.[1]) return null;
  return `${match[1]}${match[2] ?? ""}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
