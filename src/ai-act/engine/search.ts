import { getCorpus } from "./corpus";
import type { AiActChunk, AiActDocument, SearchHit } from "./types";

const STOP = new Set([
  "и", "на", "за", "от", "в", "с", "се", "да", "не", "по", "до", "как", "какво", "кои", "кой", "ли", "е", "ще", "или", "това", "при", "към", "под",
  "the", "and", "for", "with", "that", "this", "what", "does", "about", "from", "into", "are", "our", "your",
]);

const ALIASES: Array<{ pattern: RegExp; articles: string[]; terms: string[] }> = [
  { pattern: /грамотност|literacy/iu, articles: ["4", "3"], terms: ["literacy"] },
  { pattern: /high[-\s]?risk|висок[ао]? риск|високорисков/iu, articles: ["6", "5"], terms: ["high-risk"] },
  { pattern: /chatbot|чатбот|чат\s*бот/iu, articles: ["5", "50", "6"], terms: ["chatbot"] },
  { pattern: /provider|deployer|доставчик|внедрител|ползвател|\bроля\b|\bроли\b/iu, articles: ["3", "2"], terms: ["provider", "deployer"] },
  { pattern: /кандидат|подбор|наемане|recruit|employment|работ/iu, articles: ["6", "26", "5"], terms: ["workplace", "workers", "high-risk"] },
  { pattern: /срок|timeline|прилагат|влизат в сила|по-късно|already apply|enter into force/iu, articles: ["113"], terms: ["august", "february", "application"] },
  { pattern: /прозрачност|transparency/iu, articles: ["50"], terms: ["transparency", "interacting"] },
];

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 8;
const EXCERPT_CHARS = 700;

export function searchKnowledge(input: {
  query: string;
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
  const documents = new Map(corpus.documents.map((document) => [document.documentId, document]));
  const article = articleMention(query);
  const alias = aliasFor(query);
  const unique = corpus.chunks.filter((chunk) => chunk.duplicateOf === null);

  if (article) {
    const hits = unique
      .filter((chunk) => chunk.article === article)
      .sort((a, b) => rankKind(a.kind) - rankKind(b.kind) || a.referenceId.localeCompare(b.referenceId));
    return { ok: true, results: hits.slice(0, limit).map((chunk, index) => toHit(chunk, documents.get(chunk.documentId), index + 1)) };
  }

  const tokens = [...new Set([...tokenize(query), ...alias.terms])];
  const scored = unique
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, tokens, alias.articles) }))
    .filter((item) => item.score >= 5)
    .sort((a, b) => b.score - a.score || a.chunk.referenceId.localeCompare(b.chunk.referenceId));
  const collapsed = collapse(scored);
  return {
    ok: true,
    results: collapsed.slice(0, limit).map((item, index) => toHit(item.chunk, documents.get(item.chunk.documentId), index + 1)),
  };
}

export function getArticle(article: string, point?: string):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; code: string; message: string } {
  if (!/^\d{1,4}$/.test(article) || article === "0") {
    return { ok: false, code: "invalid_input", message: "Номерът на члена е невалиден." };
  }
  if (point !== undefined && !/^\d{1,3}$/.test(point)) {
    return { ok: false, code: "invalid_input", message: "Номерът на параграфа е невалиден." };
  }
  const corpus = getCorpus();
  const documents = new Map(corpus.documents.map((document) => [document.documentId, document]));
  const matches = corpus.chunks.filter((chunk) => chunk.duplicateOf === null && chunk.article === article && (point ? chunk.point === point : true));
  const cited = matches.filter((chunk) => chunk.kind !== "interpretation");
  const chosen = cited.length > 0 ? cited : [];
  if (chosen.length === 0) {
    return {
      ok: true,
      data: {
        found: false,
        article,
        point: point ?? null,
        references: [],
        message: "Няма такъв член в заредената колекция. Не допълвай текста от памет.",
      },
    };
  }
  const law = chosen.filter((chunk) => chunk.kind === "law");
  const delivered = law.length > 0 ? law : chosen.filter((chunk) => chunk.kind === "guidance");
  const deliveredIds = new Set(delivered.map((chunk) => chunk.referenceId));
  const related = matches
    .filter((chunk) => !deliveredIds.has(chunk.referenceId))
    .map((chunk) => ({ referenceId: chunk.referenceId, heading: chunk.heading, kind: chunk.kind }));
  return {
    ok: true,
    data: {
      found: true,
      article,
      point: point ?? null,
      references: delivered.map((chunk) => present(chunk, documents.get(chunk.documentId))),
      relatedNotFetched: related,
    },
  };
}

export function getReference(referenceId: string):
  | { ok: true; data: { reference: Record<string, unknown> } }
  | { ok: false; code: string; message: string } {
  if (!isReferenceId(referenceId)) return { ok: false, code: "invalid_input", message: "Невалиден идентификатор." };
  const corpus = getCorpus();
  const chunk = corpus.byId.get(referenceId);
  if (!chunk || chunk.duplicateOf) return { ok: false, code: "not_found", message: "Няма запис с този идентификатор." };
  const document = corpus.documents.find((item) => item.documentId === chunk.documentId);
  if (!document) return { ok: false, code: "not_found", message: "Няма запис с този идентификатор." };
  return { ok: true, data: { reference: present(chunk, document) } };
}

export function listSources(): Array<Record<string, unknown>> {
  return getCorpus().documents.map((document) => ({
    documentId: document.documentId,
    title: document.title,
    authority: document.authority,
    instrument: document.instrument,
    version: document.version,
    url: document.url,
    completeness: document.completeness,
    missingNote: document.missingNote,
  }));
}

export function isReferenceId(value: string): boolean {
  return /^aia_[a-z0-9-]+_p\d+$/.test(value);
}

export function articleMention(query: string): string | null {
  const match = query.match(/(?:членове|член|чл\.?|articles|article|art\.?)\s*(\d{1,4})\b/iu);
  return match?.[1] ?? null;
}

function present(chunk: AiActChunk, document: AiActDocument | undefined): Record<string, unknown> {
  return {
    referenceId: chunk.referenceId,
    title: document?.title ?? chunk.heading,
    instrument: document?.instrument ?? "",
    article: chunk.article,
    point: chunk.point,
    heading: chunk.heading,
    kind: chunk.kind,
    authority: document?.authority ?? "",
    version: document?.version ?? "",
    url: document?.url ?? "",
    text: chunk.text,
  };
}

function toHit(chunk: AiActChunk, document: AiActDocument | undefined, rank: number): SearchHit {
  return {
    referenceId: chunk.referenceId,
    rank,
    documentId: chunk.documentId,
    title: document?.title ?? chunk.heading,
    article: chunk.article,
    point: chunk.point,
    heading: chunk.heading,
    kind: chunk.kind,
    version: document?.version ?? "",
    url: document?.url ?? "",
    excerpt: chunk.text.slice(0, EXCERPT_CHARS),
    citation: false,
  };
}

function scoreChunk(chunk: AiActChunk, tokens: string[], articles: string[]): number {
  const hay = chunk.searchText;
  let overlap = 0;
  for (const token of tokens) {
    if (hay.includes(token)) overlap += 1;
  }
  let score = overlap * 2;
  if (chunk.article && articles.includes(chunk.article)) score += chunk.kind === "law" ? 8 : 5;
  if (chunk.kind === "interpretation") score *= 0.35;
  if (overlap === 0 && !(chunk.article && articles.includes(chunk.article))) return 0;
  return score;
}

function collapse(scored: Array<{ chunk: AiActChunk; score: number }>): Array<{ chunk: AiActChunk; score: number }> {
  const best = new Map<string, { chunk: AiActChunk; score: number }>();
  for (const item of scored) {
    const key = `${item.chunk.documentId}:${item.chunk.article ?? item.chunk.referenceId}:${item.chunk.kind}`;
    const current = best.get(key);
    if (!current || item.score > current.score) best.set(key, item);
  }
  return [...best.values()].sort((a, b) => b.score - a.score || a.chunk.referenceId.localeCompare(b.chunk.referenceId));
}

function aliasFor(query: string): { articles: string[]; terms: string[] } {
  const articles: string[] = [];
  const terms: string[] = [];
  for (const alias of ALIASES) {
    if (!alias.pattern.test(query)) continue;
    articles.push(...alias.articles);
    terms.push(...alias.terms);
  }
  return { articles, terms };
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP.has(token));
}

function rankKind(kind: AiActChunk["kind"]): number {
  if (kind === "law") return 0;
  if (kind === "guidance") return 1;
  return 2;
}
