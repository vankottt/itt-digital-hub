import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AnswerMarkdown } from "../../src/components/vik-proektant/AnswerMarkdown";

describe("answer markdown rendering", () => {
  it("keeps control free of tables and source chrome", () => {
    const html = renderToStaticMarkup(
      <AnswerMarkdown text={"## Обхват\n\n**член**\n\n- условие\n\n| A | B |\n| --- | --- |\n| 1 | 2 |"} mode="control" />,
    );
    expect(html).not.toContain("<table");
    expect(html).not.toContain("<h3");
    expect(html).toContain("<strong");
    expect(html).toContain("<ul");
    expect(html).toContain("Обхват");
    expect(html).toContain("1 — 2");
  });

  it("gives expert a heading and a scrollable table", () => {
    const html = renderToStaticMarkup(
      <AnswerMarkdown text={"## Резултат\n\n| Параметър | Стойност |\n| --- | --- |\n| Диаметър | 90 |"} mode="expert" />,
    );
    expect(html).toContain("<h3");
    expect(html).toContain("<table");
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("Диаметър");
  });

  it("does not turn raw html into elements", () => {
    const html = renderToStaticMarkup(<AnswerMarkdown text={'<img src=x onerror="alert(1)">'} mode="expert" />);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
