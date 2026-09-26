import { exampleById } from "@/content/vik-proektant";
import { clientKey, promptHash, takeToken } from "@/vik-proektant/comparison/limits";
import { logVik } from "@/vik-proektant/comparison/observe";
import { runComparison } from "@/vik-proektant/comparison/run";
import { comparisonModel } from "@/vik-proektant/comparison/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PROMPT = 4000;

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  if (!takeToken(`compare:${clientKey(request)}`, 8, 10 * 60_000)) {
    return Response.json({ error: "rate_limited", requestId }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_prompt", requestId }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.prompt !== "string") {
    return Response.json({ error: "invalid_prompt", requestId }, { status: 400 });
  }
  const prompt = body.prompt.trim();
  if (prompt.length < 2 || prompt.length > MAX_PROMPT) {
    return Response.json({ error: "invalid_prompt", requestId }, { status: 400 });
  }
  const exampleId = typeof body.exampleId === "string" && exampleById(body.exampleId) ? body.exampleId : null;
  const locale = body.locale === "en" ? "en" : "bg";
  const started = Date.now();
  const result = await runComparison(prompt);
  const deployment = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
  logVik({
    event: "comparison_completed",
    requestId,
    path: "control+expert",
    model: comparisonModel(),
    locale,
    exampleId,
    customPrompt: exampleId === null,
    promptHash: promptHash(prompt),
    controlOk: result.control.ok,
    expertOk: result.expert.ok,
    controlLatencyMs: result.control.latencyMs,
    expertLatencyMs: result.expert.latencyMs,
    controlError: result.control.ok ? null : result.control.error,
    expertError: result.expert.ok ? null : result.expert.error,
    retrievalCount: result.expert.ok ? result.expert.retrievalCount : 0,
    sourceCount: result.summary.sourceCount,
    calculationPerformed: result.summary.calculationPerformed,
    toolNames: result.expert.ok ? result.expert.toolNames.join(",") : "",
    fair: result.fair,
    durationMs: Date.now() - started,
    deployment,
  });
  return Response.json({
    requestId,
    fair: result.fair,
    control: publicSide(result.control),
    expert: publicSide(result.expert),
    summary: result.summary,
  });
}

function publicSide(side: Awaited<ReturnType<typeof runComparison>>["control"]) {
  if (!side.ok) return { ok: false as const, error: side.error };
  return {
    ok: true as const,
    text: side.text,
    sourceCount: side.sourceCount,
    retrievalUsed: side.retrievalCount > 0,
    calculationPerformed: side.calculationPerformed,
    calculationInputRejected: side.calculationInputRejected,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
