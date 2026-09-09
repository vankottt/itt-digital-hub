import { describe, expect, it } from "vitest";
import { parseContactForm } from "../src/lib/contact";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseContactForm", () => {
  it("accepts name and problem, with optional company and phone", () => {
    const result = parseContactForm(
      form({
        name: "  Ivan Todorov  ",
        company: "ATN",
        phone: "+359 88 000 000",
        problem: "Fragmented warranty workflow",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      kind: "ok",
      data: {
        name: "Ivan Todorov",
        company: "ATN",
        phone: "+359 88 000 000",
        problem: "Fragmented warranty workflow",
        locale: "en",
      },
    });
  });

  it("rejects a missing name or problem", () => {
    expect(parseContactForm(form({ name: "", problem: "Hello", locale: "bg" })).kind).toBe("invalid");
    expect(parseContactForm(form({ name: "Ivan", problem: "  ", locale: "bg" })).kind).toBe("invalid");
  });

  it("discards honeypot spam without treating it as invalid", () => {
    expect(
      parseContactForm(
        form({
          name: "Bot",
          problem: "spam",
          locale: "en",
          website: "https://spam.example",
        }),
      ).kind,
    ).toBe("spam");
  });
});
