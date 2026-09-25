import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../Tools/WSS - AI Asistant/Вик Асистен - Знание");
const MAX_CHUNKS = 8;
const MAX_DOCUMENTS = 3;
const MAX_CONTEXT_CHARS = 12_000;
const CHUNK_CHARS = 2_200;
const NEIGHBOR_CHARS = 900;
const MIN_SCORE = 14;

export interface VikChunk {
  documentId: string;
  documentTitle: string;
  domains: string[];
  priority: "P0" | "P1" | "P2" | "";
  article: string;
  chapter: string;
  section: string;
  part: string;
  text: string;
  sourcePath: string;
  kind: "article" | "annex";
  previewTokens: Set<string>;
}

export interface SelectedChunk {
  chunk: VikChunk;
  score: number;
  neighbor: boolean;
  limitations: string[];
}

export interface RetrievalResult {
  confident: boolean;
  chunks: SelectedChunk[];
  selectedChars: number;
  limitationHits: number;
  standardGuard: boolean;
  buildMs: number;
  retrieveMs: number;
  context: string;
}

interface Limitation {
  location: string;
  type: string;
  safe_for_numeric_answer?: boolean;
  note?: string;
}

let cached: { chunks: VikChunk[]; limitations: Map<string, Limitation[]>; buildMs: number } | null = null;

export function vikKnowledgeRoot(): string {
  return ROOT;
}

export function resetVikIndexForTests(): void {
  cached = null;
}

export function retrieveVikContext(question: string, priorUserText = ""): RetrievalResult {
  const started = performance.now();
  const index = loadIndex();
  const query = analyze(foldFollowUp(question, priorUserText));
  const ranked = index.chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, query) }))
    .filter((item) => item.score >= MIN_SCORE)
    .sort((left, right) => right.score - left.score || left.chunk.documentId.localeCompare(right.chunk.documentId));

  const exact = Boolean(ranked[0] && query.article && ranked[0].score >= 90);
  const limit = exact ? 4 : MAX_CHUNKS;
  const selected: SelectedChunk[] = [];
  const documents = new Set<string>();
  for (const item of ranked) {
    if (selected.length >= limit) break;
    if (!documents.has(item.chunk.documentId) && documents.size >= MAX_DOCUMENTS) continue;
    documents.add(item.chunk.documentId);
    selected.push({
      chunk: item.chunk,
      score: item.score,
      neighbor: false,
      limitations: limitationsFor(index.limitations, item.chunk),
    });
  }
  if (exact && selected[0]) addNeighbors(index.chunks, selected);

  let used = 0;
  const kept: SelectedChunk[] = [];
  for (const item of selected) {
    const allowance = item.neighbor ? NEIGHBOR_CHARS : CHUNK_CHARS;
    const room = MAX_CONTEXT_CHARS - used;
    if (room < 240) break;
    const text = item.chunk.text.slice(0, Math.min(allowance, room));
    used += text.length;
    kept.push({ ...item, chunk: { ...item.chunk, text } });
  }

  const limitationHits = kept.reduce((sum, item) => sum + item.limitations.length, 0);
  return {
    confident: kept.length > 0,
    chunks: kept,
    selectedChars: used,
    limitationHits,
    standardGuard: query.standard,
    buildMs: index.buildMs,
    retrieveMs: Math.max(0, Math.round(performance.now() - started)),
    context: kept.map((item) => renderChunk(item)).join("\n\n"),
  };
}

function loadIndex(): { chunks: VikChunk[]; limitations: Map<string, Limitation[]>; buildMs: number } {
  if (cached) return cached;
  const started = performance.now();
  const chunks: VikChunk[] = [];
  for (const file of markdownFiles(path.join(ROOT, "knowledge"))) chunks.push(...chunksFromFile(file));
  cached = {
    chunks,
    limitations: loadLimitations(),
    buildMs: Math.max(0, Math.round(performance.now() - started)),
  };
  return cached;
}

function markdownFiles(directory: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(directory)) {
    if (name.startsWith(".")) continue;
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) {
      found.push(...markdownFiles(full));
      continue;
    }
    if (name.endsWith(".md") && name !== "README.md") found.push(full);
  }
  return found;
}

function chunksFromFile(file: string): VikChunk[] {
  const raw = readFileSync(file, "utf8");
  const { meta, body } = splitFrontMatter(raw);
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const base = {
    documentId: meta.id || path.basename(file, ".md"),
    documentTitle: meta.title || path.basename(file),
    domains: meta.domains,
    priority: meta.priority,
    sourcePath: relative,
  };
  const chunks: VikChunk[] = [];
  let part = "";
  let chapter = "";
  let section = "";
  let current: { kind: VikChunk["kind"]; article: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const text = current.lines.join("\n").trim();
    if (text) {
      chunks.push({
        ...base,
        article: current.article,
        chapter,
        section,
        part,
        text,
        kind: current.kind,
        previewTokens: tokens(normalize(`${base.documentTitle} ${part} ${chapter} ${section} ${current.article} ${text.slice(0, 1000)}`)),
      });
    }
    current = null;
  };

  for (const line of body.split(/\r?\n/)) {
    const heading = /^(#{2,6})\s+(.+)$/.exec(line.trim());
    if (!heading?.[2]) {
      current?.lines.push(line);
      continue;
    }
    const label = heading[2].trim();
    const article = /^Чл\.\s*(\d+[а-я]?)/i.exec(label);
    const annex = /^Приложение\s*№\s*(\d+)/i.exec(label);
    if (article?.[1]) {
      flush();
      current = { kind: "article", article: article[1].toLowerCase(), lines: [label] };
      continue;
    }
    if (annex?.[1]) {
      flush();
      current = { kind: "annex", article: `приложение ${annex[1]}`, lines: [label] };
      continue;
    }
    if (/^част\b/i.test(label)) {
      part = label;
      chapter = "";
      section = "";
    } else if (/^глава\b/i.test(label)) {
      chapter = label;
      section = "";
    } else if (/^раздел\b/i.test(label)) {
      section = label;
    }
    current?.lines.push(label);
  }
  flush();
  return chunks;
}

function splitFrontMatter(raw: string): {
  meta: { id: string; title: string; domains: string[]; priority: VikChunk["priority"] };
  body: string;
} {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  const block = match?.[1] ?? "";
  const body = match ? raw.slice(match[0].length) : raw;
  const domains: string[] = [];
  let collectingDomains = false;
  let id = "";
  let title = "";
  let priority: VikChunk["priority"] = "";
  for (const line of block.split(/\r?\n/)) {
    if (collectingDomains) {
      const item = /^\s+-\s+(\S+)/.exec(line);
      if (item?.[1]) {
        domains.push(item[1]);
        continue;
      }
      collectingDomains = false;
    }
    if (line.startsWith("domain:")) {
      collectingDomains = true;
      continue;
    }
    if (line.startsWith("id:")) id = unquote(line.slice(3));
    if (line.startsWith("title:")) title = unquote(line.slice(6));
    if (line.startsWith("priority:")) {
      const value = unquote(line.slice(9));
      priority = value === "P0" || value === "P1" || value === "P2" ? value : "";
    }
  }
  return { meta: { id, title, domains, priority }, body };
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1).replace(/\\"/g, '"');
  return trimmed;
}

function loadLimitations(): Map<string, Limitation[]> {
  const map = new Map<string, Limitation[]>();
  const parsed = JSON.parse(readFileSync(path.join(ROOT, "manifests/content_limitations.json"), "utf8")) as {
    documents?: Array<{ document_id?: string; limitations?: Limitation[] }>;
  };
  for (const document of parsed.documents ?? []) {
    if (document.document_id && document.limitations) map.set(document.document_id, document.limitations);
  }
  return map;
}

function limitationsFor(map: Map<string, Limitation[]>, chunk: VikChunk): string[] {
  const notes: string[] = [];
  for (const item of map.get(chunk.documentId) ?? []) {
    const article = /чл\.\s*(\d+[а-я]?)/i.exec(item.location)?.[1]?.toLowerCase();
    const annex = /приложение\s*№\s*(\d+)/i.exec(item.location)?.[1];
    const generic = /приложен|графич/i.test(item.location);
    const matches =
      (article && article === chunk.article) ||
      (annex && chunk.article === `приложение ${annex}`) ||
      (generic && chunk.kind === "annex");
    if (!matches || item.safe_for_numeric_answer !== false) continue;
    notes.push(
      `${item.type}: ${item.location}. ${item.note ?? "Тази част не е надеждно извлечена като текст. Не давай нормативна числова стойност от памет."}`,
    );
  }
  return notes;
}

interface Query {
  normalized: string;
  tokens: Set<string>;
  article: string;
  documents: Set<string>;
  standard: boolean;
}

function foldFollowUp(question: string, priorUserText: string): string {
  const prior = priorUserText.trim();
  const current = question.trim();
  if (!prior) return question;
  const refersBack = /^(а|и)\s/i.test(current) || (/[ѝ]/.test(current) && !/наредба|чл\.|рд-/i.test(current));
  return refersBack ? `${prior}\n${current}` : question;
}

function analyze(question: string): Query {
  const normalized = normalize(question);
  const article = /чл\.?\s*(\d+\s*[а-я]?)/i.exec(normalized)?.[1]?.replace(/\s+/g, "").toLowerCase() ?? "";
  const documents = new Set<string>();
  if (/рд\s*[-.]?\s*02\s*[-.]?\s*20\s*[-.]?\s*2(?!\s*[-.]?\s*8)/.test(normalized)) documents.add("rd-02-20-2-2024");
  if (/рд\s*[-.]?\s*02\s*[-.]?\s*20\s*[-.]?\s*8/.test(normalized)) documents.add("rd-02-20-8-2013");
  if (/рд\s*[-.]?\s*02\s*[-.]?\s*20\s*[-.]?\s*1/.test(normalized)) documents.add("rd-02-20-1-2020");
  if (/наредба\s*№?\s*9\b/.test(normalized) || /питейна вода/.test(normalized)) documents.add("naredba-9-2001");
  if (/наредба\s*№?\s*8\b/.test(normalized) || /технически проводи/.test(normalized)) documents.add("naredba-8-1999");
  if (/соз|санитарно-охранител/.test(normalized)) documents.add("naredba-3-2000-soz");
  if (/подземн/.test(normalized)) documents.add("naredba-1-2007-podzemni-vodi");
  if (/зут|устройство на територията/.test(normalized)) documents.add("zut");
  if (/закон за водите/.test(normalized)) documents.add("zakon-za-vodite");
  if (/присъедин/.test(normalized) || /наредба\s*№?\s*4\b[\s\S]{0,40}2004/.test(normalized)) {
    documents.add("naredba-4-2004-prisaedinyavane");
  }
  if (/сградн/.test(normalized) || /наредба\s*№?\s*4\b[\s\S]{0,40}2005/.test(normalized)) {
    documents.add("naredba-4-2005-sgradni-vik");
  }
  if (/инвестиционн/.test(normalized) || /наредба\s*№?\s*4\b[\s\S]{0,40}2001/.test(normalized)) {
    documents.add("naredba-4-2001-investicionni-proekti");
  }
  if (/канализационни системи/.test(normalized)) documents.add("rd-02-20-8-2013");
  if (/външн\w*\s+водоснабд|водоснабдителни системи/.test(normalized)) documents.add("rd-02-20-2-2024");
  return {
    normalized,
    tokens: tokens(normalized),
    article,
    documents,
    standard: /бдс|bds|\biso\b|\bdin\b|\ben\s*\d/i.test(question),
  };
}

const DOMAIN_WORDS: Record<string, string[]> = {
  connections: ["присъединяване", "присъединяван", "потребител"],
  external_water: ["водоснабдител", "външен", "водопровод"],
  water_supply: ["водоснабдяване", "водоснабдител"],
  water_sources: ["водоизточник", "водовземане"],
  pumping: ["помпена", "помпи"],
  reservoirs: ["резервоар", "водонапор"],
  drinking_water: ["питейна", "питейно"],
  wastewater: ["отпадъчн", "канализац"],
  external_sewer: ["канализацион", "канализация"],
  stormwater: ["дъждов"],
  groundwater: ["подземн"],
  sanitary_protection: ["санитарно", "соз"],
  fire_water: ["пожар"],
  easements: ["сервитут"],
  utility_layout: ["проводи"],
  discharge: ["заустване"],
  construction: ["строител"],
  investment_design: ["инвестицион"],
  permits: ["разрешителн"],
};

function scoreChunk(chunk: VikChunk, query: Query): number {
  let score = chunk.priority === "P0" ? 3 : chunk.priority === "P1" ? 1 : 0;
  const documentHit = query.documents.has(chunk.documentId);
  if (documentHit) score += 35;
  if (!query.article && documentHit && chunk.article === "1") score += 40;
  if (query.article && chunk.article === query.article) score += documentHit ? 90 : 22;
  let titleHits = 0;
  const title = normalize(chunk.documentTitle);
  for (const token of query.tokens) {
    if (token.length >= 5 && title.includes(token)) titleHits += 1;
    if (chunk.previewTokens.has(token)) score += 2;
  }
  score += Math.min(30, titleHits * 10);
  for (const domain of chunk.domains) {
    for (const word of DOMAIN_WORDS[domain] ?? []) {
      if (query.normalized.includes(word)) score += 8;
    }
  }
  return score;
}

function addNeighbors(all: VikChunk[], selected: SelectedChunk[]): void {
  const first = selected[0];
  if (!first || first.chunk.kind !== "article") return;
  const same = all.filter((chunk) => chunk.documentId === first.chunk.documentId && chunk.kind === "article");
  const index = same.findIndex((chunk) => chunk.article === first.chunk.article && chunk.part === first.chunk.part && chunk.chapter === first.chunk.chapter);
  for (const offset of [-1, 1]) {
    const neighbor = same[index + offset];
    if (!neighbor || selected.some((item) => item.chunk.article === neighbor.article && item.chunk.chapter === neighbor.chapter)) continue;
    selected.push({ chunk: neighbor, score: first.score - 5, neighbor: true, limitations: [] });
  }
}

function renderChunk(item: SelectedChunk): string {
  const limitation =
    item.limitations.length > 0
      ? `limit: Наличният нормативен източник съдържа формула, таблица или схема, която не е надеждно извлечена. Не давай нормативна числова стойност от памет. Посочи източника и ограничението.\n${item.limitations.join("\n")}`
      : "";
  return [
    "[SOURCE]",
    `document: ${item.chunk.documentTitle}`,
    `id: ${item.chunk.documentId}`,
    `article: ${item.chunk.article || "—"}`,
    `part: ${item.chunk.part || "—"}`,
    `chapter: ${item.chunk.chapter || "—"}`,
    `section: ${item.chunk.section || "—"}`,
    `path: ${item.chunk.sourcePath}`,
    `score: ${item.score}`,
    limitation,
    "[/SOURCE]",
    item.chunk.text,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[„“”"«»]/g, " ")
    .replace(/[^\p{L}\p{N}./-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): Set<string> {
  const set = new Set<string>();
  for (const token of value.split(" ")) {
    if (token.length >= 3 || /^\d+[а-я]?$/.test(token)) set.add(token);
  }
  return set;
}
