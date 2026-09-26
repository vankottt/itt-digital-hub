import { readFileSync } from "node:fs";
import path from "node:path";
import { COMPARISON_MAX_OUTPUT_TOKENS, CONTROL_INSTRUCTIONS, comparisonModel, expertMcpTool } from "./config";

export type ComparisonRequestBody = {
  model: string;
  store: false;
  max_output_tokens: number;
  instructions: string;
  input: string;
  tools?: [ReturnType<typeof expertMcpTool>];
};

export function loadExpertInstructions(cwd = process.cwd(), today = new Date().toISOString().slice(0, 10)): string {
  const skill = readFileSync(path.join(cwd, "src/ai-act/skill/SKILL.md"), "utf8").trim();
  return `${skill}\n\n## Runtime\n\nCurrent date for comparing dates that appear in a fetched passage: ${today}. Do not invent other dates.`;
}

export function buildComparisonRequests(
  userPrompt: string,
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
  today = new Date().toISOString().slice(0, 10),
) {
  const model = comparisonModel(env);
  const shared = { model, store: false as const, max_output_tokens: COMPARISON_MAX_OUTPUT_TOKENS };
  const control: ComparisonRequestBody = { ...shared, instructions: CONTROL_INSTRUCTIONS, input: userPrompt };
  const expert: ComparisonRequestBody = {
    ...shared,
    instructions: loadExpertInstructions(cwd, today),
    input: userPrompt,
    tools: [expertMcpTool(env)],
  };
  return { model, control, expert };
}
