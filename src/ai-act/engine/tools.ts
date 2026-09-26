import { getArticle, getReference, isReferenceId, listSources, searchKnowledge } from "./search";

export const AI_ACT_TOOL_NAMES = [
  "search_ai_act_knowledge",
  "get_ai_act_article",
  "get_ai_act_reference",
  "list_ai_act_sources",
] as const;

export type AiActToolName = (typeof AI_ACT_TOOL_NAMES)[number];

export type ToolDefinition = {
  name: AiActToolName;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type ToolCallResult = { ok: true; data: unknown } | { ok: false; code: string; message: string };

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "search_ai_act_knowledge",
    description:
      "Searches the AI Act extract collection and returns ranked candidates. Candidates are not citations. Call get_ai_act_article or get_ai_act_reference before relying on a passage. Does not invent missing articles.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", minLength: 2, maxLength: 400 },
        limit: { type: "integer", minimum: 1, maximum: 8 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_ai_act_article",
    description:
      "Fetches the loaded extract for one article number. Returns found:false when that article is not in the collection. Does not reconstruct missing law.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        article: { type: "string", minLength: 1, maxLength: 4 },
        point: { type: "string", minLength: 1, maxLength: 3 },
      },
      required: ["article"],
    },
  },
  {
    name: "get_ai_act_reference",
    description: "Fetches one candidate by referenceId, including whether the passage is law, official guidance, or an ITT note.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { referenceId: { type: "string", minLength: 8, maxLength: 180 } },
      required: ["referenceId"],
    },
  },
  {
    name: "list_ai_act_sources",
    description: "Lists the documents in the collection and their limits, without full text. This catalogue is not a citation.",
    inputSchema: { type: "object", additionalProperties: false, properties: {}, required: [] },
  },
];

export function callTool(name: string, args: unknown): ToolCallResult {
  const input = isRecord(args) ? args : {};
  if (!isToolName(name)) return { ok: false, code: "invalid_input", message: "Непознат инструмент." };
  const unknown = unknownField(name, input);
  if (unknown) return unknown;
  if (name === "search_ai_act_knowledge") {
    const result = searchKnowledge({
      query: typeof input.query === "string" ? input.query : "",
      limit: typeof input.limit === "number" ? input.limit : undefined,
    });
    if (!result.ok) return result;
    return {
      ok: true,
      data: {
        results: result.results,
        resultCount: result.results.length,
        citations: false,
        note: "Search candidates are not used sources. Fetch a reference before citing it.",
      },
    };
  }
  if (name === "get_ai_act_article") {
    const article = typeof input.article === "string" ? input.article : "";
    const point = typeof input.point === "string" ? input.point : undefined;
    const result = getArticle(article, point);
    return result.ok ? { ok: true, data: result.data } : result;
  }
  if (name === "get_ai_act_reference") {
    const referenceId = typeof input.referenceId === "string" ? input.referenceId : "";
    if (referenceId && !isReferenceId(referenceId)) return { ok: false, code: "invalid_input", message: "Невалиден идентификатор." };
    const result = getReference(referenceId);
    return result.ok ? { ok: true, data: result.data } : result;
  }
  return { ok: true, data: { sources: listSources(), citations: false } };
}

export function isToolName(value: string): value is AiActToolName {
  return (AI_ACT_TOOL_NAMES as readonly string[]).includes(value);
}

function unknownField(name: AiActToolName, input: Record<string, unknown>): ToolCallResult | null {
  const definition = toolDefinitions.find((tool) => tool.name === name);
  const properties = definition?.inputSchema.properties;
  const allowed = new Set(properties && typeof properties === "object" ? Object.keys(properties) : []);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) return { ok: false, code: "invalid_input", message: "Заявката съдържа неочаквано поле." };
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
