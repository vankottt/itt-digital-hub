import { describe, expect, it } from "vitest";
import { calculateHazenWilliams, calculateManningFullPipe, calculatePipeDiameter } from "../../src/vik-proektant/engine/calculations";
import { handleMcpHttp, mcpHealth } from "../../src/vik-proektant/mcp/http";

describe("vik calculations", () => {
  it("computes internal diameter from flow and velocity", () => {
    const result = calculatePipeDiameter({ flow: 12, flow_unit: "L/s", velocity_m_s: 1 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.calculation.result.diameter_mm).toBeCloseTo(123.6077, 3);
    expect(result.calculation.units.diameter_mm).toBe("mm");
    expect(result.calculation.assumptions.length).toBeGreaterThan(0);
  });

  it("rejects missing and malformed inputs", () => {
    expect(calculatePipeDiameter({ flow: 12, flow_unit: "L/s" }).ok).toBe(false);
    expect(calculateHazenWilliams({ flow: 10, flow_unit: "buckets", diameter_mm: 100, length_m: 10, hazen_williams_c: 120 }).ok).toBe(false);
    expect(calculateManningFullPipe({ diameter_mm: 300, slope_m_per_m: 0.001, manning_n: "0.013" }).ok).toBe(false);
    expect(calculatePipeDiameter({ flow: 12, flow_unit: "L/s", velocity_m_s: Number.POSITIVE_INFINITY }).ok).toBe(false);
  });
});

describe("vik mcp protocol", () => {
  it("initializes, lists tools and calls each tool", async () => {
    const health = mcpHealth();
    expect(health.status).toBe("ok");
    expect(health.tools).toContain("search_vik_knowledge");
    expect(health.tools).toContain("calculate_pipe_diameter");

    const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
    expect(init.result).toMatchObject({ protocolVersion: "2025-06-18", serverInfo: { name: "vik-projektant" } });

    const listed = await rpc("tools/list", {});
    const tools = (listed.result as { tools: Array<{ name: string }> }).tools.map((tool) => tool.name);
    expect(tools).toEqual(health.tools);

    const search = await rpc("tools/call", { name: "search_vik_knowledge", arguments: { query: "питейна вода Наредба № 9", limit: 2 } });
    expect(search.result).toMatchObject({ isError: false });
    const sources = await rpc("tools/call", { name: "list_vik_sources", arguments: {} });
    expect(sources.result).toMatchObject({ isError: false });
    const missing = await rpc("tools/call", { name: "get_vik_reference", arguments: { referenceId: "vk1_missing-doc_a1_p0" } });
    expect(missing.result).toMatchObject({ isError: true });
    const diameter = await rpc("tools/call", {
      name: "calculate_pipe_diameter",
      arguments: { flow: 12, flow_unit: "L/s", velocity_m_s: 1 },
    });
    expect(JSON.parse((diameter.result as { content: Array<{ text: string }> }).content[0]?.text ?? "{}").result.diameter_mm).toBeCloseTo(123.6, 1);
    const invalid = await rpc("tools/call", { name: "calculate_pipe_diameter", arguments: { flow: "twelve" } });
    expect(invalid.result).toMatchObject({ isError: true });
    const unknown = await rpc("nope", {});
    expect(unknown.error).toMatchObject({ code: -32601 });
  });

  it("rejects oversized, batch and non-post requests", async () => {
    const huge = await handleMcpHttp(new Request("http://local/mcp", { method: "POST", body: "x".repeat(300_000) }));
    expect(huge.status).toBe(413);
    const batch = await handleMcpHttp(new Request("http://local/mcp", { method: "POST", body: "[]" }));
    expect(batch.status).toBe(400);
    const get = await handleMcpHttp(new Request("http://local/mcp", { method: "GET" }));
    expect(get.status).toBe(405);
  });
});

async function rpc(method: string, params: unknown, id: number | null = 1) {
  const response = await handleMcpHttp(
    new Request("http://local/mcp", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    }),
  );
  return (await response.json()) as { result?: unknown; error?: { code: number } };
}
