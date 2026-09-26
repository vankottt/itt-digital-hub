import {
  calculateFlowVelocity,
  calculateHazenWilliams,
  calculateManningFullPipe,
  calculatePipeDiameter,
} from "./calculations";
import { getCorpus } from "./corpus";
import { getReference, listSources, searchKnowledge } from "./search";

export const VIK_TOOL_NAMES = [
  "search_vik_knowledge",
  "get_vik_reference",
  "list_vik_sources",
  "calculate_pipe_diameter",
  "calculate_flow_velocity",
  "calculate_hazen_williams_head_loss",
  "calculate_manning_full_pipe",
] as const;

export type VikToolName = (typeof VIK_TOOL_NAMES)[number];

export type ToolDefinition = {
  name: VikToolName;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type ToolCallResult = { ok: true; data: unknown } | { ok: false; code: string; message: string };

const number = { type: "number" };
const querySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    query: { type: "string", minLength: 2, maxLength: 400 },
    category: { type: "string", maxLength: 80 },
    source: { type: "string", maxLength: 160 },
    limit: { type: "integer", minimum: 1, maximum: 8 },
  },
  required: ["query"],
};

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "search_vik_knowledge",
    description:
      "Търси в нормативната база на ВиК Проектант. Връща подредени кратки откъси с идентификатор, източник, раздел и член. Не измисля липсващи текстове.",
    inputSchema: querySchema,
  },
  {
    name: "get_vik_reference",
    description: "Връща един стабилен запис от базата по referenceId, със съседния контекст и метаданните на източника.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { referenceId: { type: "string", minLength: 8, maxLength: 180 } },
      required: ["referenceId"],
    },
  },
  {
    name: "list_vik_sources",
    description: "Изброява документите в базата и ограниченията им, без пълния текст.",
    inputSchema: { type: "object", additionalProperties: false, properties: {}, required: [] },
  },
  {
    name: "calculate_pipe_diameter",
    description: "Изчислява вътрешен диаметър от дебит и скорост. Не избира търговски DN и не попълва липсващи входни данни.",
    inputSchema: flowSchema(["velocity_m_s"]),
  },
  {
    name: "calculate_flow_velocity",
    description: "Изчислява средна скорост при пълен кръгъл профил от дебит и диаметър.",
    inputSchema: flowSchema(["diameter_mm"]),
  },
  {
    name: "calculate_hazen_williams_head_loss",
    description: "Изчислява загуби по Hazen–Williams. C, дължината, диаметърът и дебитът са задължителни.",
    inputSchema: flowSchema(["diameter_mm", "length_m", "hazen_williams_c"]),
  },
  {
    name: "calculate_manning_full_pipe",
    description: "Изчислява скорост и дебит по Manning за пълна кръгла тръба. n и наклонът са задължителни.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { diameter_mm: number, slope_m_per_m: number, manning_n: number },
      required: ["diameter_mm", "slope_m_per_m", "manning_n"],
    },
  },
];

export function callTool(name: string, args: unknown): ToolCallResult {
  const input = isRecord(args) ? args : {};
  if (!isToolName(name)) return { ok: false, code: "invalid_input", message: "Непознат инструмент." };
  const unknown = unknownField(name, input);
  if (unknown) return unknown;
  if (name === "search_vik_knowledge") {
    const result = searchKnowledge({
      query: typeof input.query === "string" ? input.query : "",
      category: typeof input.category === "string" ? input.category : undefined,
      source: typeof input.source === "string" ? input.source : undefined,
      limit: typeof input.limit === "number" ? input.limit : undefined,
    });
    return result.ok ? { ok: true, data: { results: result.results, resultCount: result.results.length } } : result;
  }
  if (name === "get_vik_reference") {
    const result = getReference(typeof input.referenceId === "string" ? input.referenceId : "");
    return result.ok ? { ok: true, data: result.reference } : result;
  }
  if (name === "list_vik_sources") return { ok: true, data: { sources: listSources(), sourceCount: getCorpus().documents.length } };
  if (name === "calculate_pipe_diameter") return asTool(calculatePipeDiameter(input));
  if (name === "calculate_flow_velocity") return asTool(calculateFlowVelocity(input));
  if (name === "calculate_hazen_williams_head_loss") return asTool(calculateHazenWilliams(input));
  return asTool(calculateManningFullPipe(input));
}

export function isToolName(value: string): value is VikToolName {
  return (VIK_TOOL_NAMES as readonly string[]).includes(value);
}

function flowSchema(extra: string[]): Record<string, unknown> {
  const properties: Record<string, unknown> = { flow: number, flow_unit: { type: "string", enum: ["L/s", "m3/s"] } };
  for (const key of extra) properties[key] = number;
  return {
    type: "object",
    additionalProperties: false,
    properties,
    required: ["flow", "flow_unit", ...extra],
  };
}

function asTool(result: { ok: true; calculation: unknown } | { ok: false; code: string; message: string }): ToolCallResult {
  return result.ok ? { ok: true, data: result.calculation } : result;
}

function unknownField(name: VikToolName, input: Record<string, unknown>): ToolCallResult | null {
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
