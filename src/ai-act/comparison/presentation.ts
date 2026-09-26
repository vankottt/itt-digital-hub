import { aiAct } from "@/content/ai-act";
import type { Locale } from "@/lib/i18n";

export type SourceKind = "law" | "guidance" | "engineering" | "interpretation";
export type ToolKind = "retrieval" | "reference" | "catalogue";

export type PublicSource = {
  title: string;
  article: string | null;
  annex: string | null;
  locator: string;
  authority: string;
  version: string;
  url: string;
  kind: SourceKind;
};

export function collectExecution(calls: Array<{ name: string; output: string }>): {
  sources: PublicSource[];
  toolKinds: ToolKind[];
  retrievalCount: number;
  fetchedCount: number;
} {
  const drafts: SourceDraft[] = [];
  const toolKinds: ToolKind[] = [];
  let retrievalCount = 0;
  let fetchedCount = 0;

  for (const call of calls) {
    const kind = toolKind(call.name);
    if (kind && !toolKinds.includes(kind)) toolKinds.push(kind);
    if (kind === "retrieval") retrievalCount += 1;
    if (kind !== "reference") continue;
    const payload = unwrap(call.output);
    if (isRecord(payload) && foundFlag(payload) === false) continue;
    const records = sourceRecords(payload);
    if (records.length === 0) continue;
    fetchedCount += 1;
    for (const draft of records.flatMap(sourceDraft)) drafts.push(draft);
  }

  return { sources: groupSources(drafts), toolKinds, retrievalCount, fetchedCount };
}

type SourceDraft = PublicSource;

function toolKind(name: string): ToolKind | null {
  if (name === "search_ai_act_knowledge") return "retrieval";
  if (name === "get_ai_act_article" || name === "get_ai_act_annex" || name === "get_ai_act_reference") return "reference";
  if (name === "list_ai_act_sources") return "catalogue";
  return null;
}

function sourceRecords(payload: unknown): Record<string, unknown>[] {
  if (!isRecord(payload)) return [];
  if (payload.citations === false && !Array.isArray(payload.references) && !isRecord(payload.reference)) return [];
  if (Array.isArray(payload.references)) return payload.references.filter(isRecord);
  if (isRecord(payload.reference)) return [payload.reference];
  return [];
}

function sourceDraft(record: Record<string, unknown>): SourceDraft[] {
  const title = text(record.title);
  const kind = kindOf(record.kind);
  if (!title || !kind) return [];
  const article = text(record.article) || null;
  const annex = text(record.annex) || null;
  const point = text(record.point);
  const heading = text(record.heading);
  const locator = annex ? `Приложение ${annex}` : point && article ? `Член ${article}, точка ${point}` : article ? `Член ${article}` : heading;
  return [
    {
      title,
      article,
      annex,
      locator,
      authority: authorityLabel(kind, text(record.authority)),
      version: text(record.version),
      url: httpsUrl(record.url),
      kind,
    },
  ];
}

function groupSources(drafts: SourceDraft[]): PublicSource[] {
  const groups = new Map<string, PublicSource>();
  for (const draft of drafts) {
    const key = [draft.title, draft.article ?? "", draft.annex ?? "", draft.kind].join("|");
    const current = groups.get(key) ?? { ...draft, locator: "" };
    const pieces = current.locator ? current.locator.split(" · ") : [];
    if (draft.locator && !pieces.includes(draft.locator) && pieces.length < 4) {
      current.locator = current.locator ? `${current.locator} · ${draft.locator}` : draft.locator;
    }
    if (!current.url && draft.url) current.url = draft.url;
    groups.set(key, current);
  }
  return [...groups.values()];
}

function authorityLabel(kind: SourceKind, authority: string): string {
  if (kind === "engineering" || kind === "interpretation" || authority === "itt") return "ITT Digital Hub";
  if (kind === "guidance" || authority === "european-commission") return "European Commission";
  return "EUR-Lex";
}

function kindOf(value: unknown): SourceKind | null {
  if (value === "law" || value === "guidance" || value === "engineering" || value === "interpretation") return value;
  return null;
}

function foundFlag(payload: Record<string, unknown>): boolean | null {
  if (typeof payload.found === "boolean") return payload.found;
  return null;
}

function unwrap(output: string): unknown {
  const trimmed = output.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isRecord(parsed) && Array.isArray(parsed.content)) {
      const textPart = parsed.content.find((item) => isRecord(item) && typeof item.text === "string");
      if (isRecord(textPart) && typeof textPart.text === "string") return unwrap(textPart.text);
    }
    return parsed;
  } catch {
    return null;
  }
}

function httpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function expertStatusLine(locale: Locale, sourceCount: number, retrievalUsed: boolean): string {
  const text = aiAct.compare;
  const parts: string[] = [];
  if (sourceCount > 0) parts.push(sourceCount === 1 ? text.sourceOne[locale] : `${sourceCount} ${text.sourceMany[locale]}`);
  if (retrievalUsed) parts.push(text.retrieval[locale]);
  return parts.join(" · ");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
