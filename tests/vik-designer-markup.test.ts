import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnswerBody } from "../src/components/vik-designer/AnswerBody";

function html(markdown: string): string {
  return renderToStaticMarkup(createElement(AnswerBody, { markdown, sourceLabel: "Източник" }));
}

describe("ViK answer markup", () => {
  it("renders bold, lists and code without leaving markdown markers", () => {
    const markup = html("**Чл. 1**, ал. 1\n\n- водопровод\n- канализация\n\nКод: `qц`");
    expect(markup).toContain("<strong>Чл. 1</strong>");
    expect(markup).toContain("<li>водопровод</li>");
    expect(markup).toContain("<code");
    expect(markup).not.toContain("**");
    expect(markup).not.toContain("`qц`");
  });

  it("renders a quoted passage as a source and a limitation as a note", () => {
    const markup = html("> С наредбата се определят изискванията.\n\n*Забележка: демонстрационна справка.*");
    expect(markup).toContain("Източник");
    expect(markup).toContain("<blockquote");
    expect(markup).toContain("Забележка: демонстрационна справка.");
    expect(markup).toContain("bg-paper-2");
  });

  it("keeps markup as text", () => {
    const markup = html("<script>alert(1)</script>");
    expect(markup).not.toContain("<script>");
    expect(markup).toContain("&lt;script&gt;");
  });
});
