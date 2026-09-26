import { describe, expect, it } from "vitest";
import { collectExecution, parseMarkdown } from "../../src/vik-proektant/comparison/presentation";

describe("execution presentation", () => {
  it("does not turn a catalogue listing or model prose into cited sources", () => {
    const execution = collectExecution([
      {
        name: "list_vik_sources",
        output: JSON.stringify({ sources: [{ documentId: "all", title: "Цялата база" }] }),
      },
      {
        name: "search_vik_knowledge",
        output: JSON.stringify({ results: [{ documentId: "only-id" }] }),
      },
    ]);
    expect(execution.sources).toEqual([]);
    expect(execution.sourceIds.has("only-id")).toBe(true);
    expect(execution.toolKinds).toEqual(["retrieval"]);
  });

  it("keeps a rejected calculation out of the result values", () => {
    const execution = collectExecution([
      {
        name: "calculate_pipe_diameter",
        output: JSON.stringify({ error: { code: "invalid_input", message: "Липсва дебит." } }),
      },
    ]);
    expect(execution.calculationPerformed).toBe(false);
    expect(execution.calculationInputRejected).toBe(true);
    expect(execution.calculations[0]?.results).toEqual([]);
    expect(execution.calculations[0]?.message).toBe("Липсва дебит.");
  });
});

describe("markdown safety", () => {
  it("renders control as plain blocks and drops unsafe links", () => {
    const control = parseMarkdown("## Заглавие\n\n**удебелено** и *курсив* и `код`\n\n- точка\n\n[лош](javascript:alert(1))\n\n<script>alert(1)</script>", "control");
    expect(control.some((block) => block.type === "heading" || block.type === "table")).toBe(false);
    expect(JSON.stringify(control)).toContain("Заглавие");
    expect(JSON.stringify(control)).toContain("удебелено");
    expect(JSON.stringify(control)).not.toContain('"href":"javascript:');
    expect(JSON.stringify(control)).toContain("<script>alert(1)</script>");
  });

  it("keeps expert headings and tables without rewriting the words", () => {
    const expert = parseMarkdown("## Директен отговор\n\n| Параметър | Стойност |\n| --- | --- |\n| Дебит | 4.8 |", "expert");
    expect(expert[0]).toEqual({ type: "heading", level: 2, text: "Директен отговор" });
    expect(expert[1]).toMatchObject({ type: "table", headers: ["Параметър", "Стойност"], rows: [["Дебит", "4.8"]] });
  });
});
