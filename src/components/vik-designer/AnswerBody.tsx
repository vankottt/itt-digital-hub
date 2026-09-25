import type { ReactNode } from "react";

type Inline =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: Inline[] }
  | { kind: "italic"; children: Inline[] }
  | { kind: "code"; text: string };

type Block =
  | { type: "p"; inlines: Inline[] }
  | { type: "note"; inlines: Inline[] }
  | { type: "quote"; inlines: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] };

const NOTE =
  /^(забележка|note)(?=[\s:]|$)|не мога да (дам|отговоря|посоча)|cannot (give|confirm|answer)|не е наличн|пълният текст|the full text of (the |a )?standard/i;

export function AnswerBody({ markdown, sourceLabel }: { markdown: string; sourceLabel: string }) {
  const blocks = parseAnswer(markdown);
  const firstQuote = blocks.findIndex((block) => block.type === "quote");
  return (
    <div className="mt-3 grid gap-3 text-body leading-relaxed text-ink">
      {blocks.map((block, index) => {
        if (block.type === "quote") {
          return (
            <blockquote key={index} className="border-l-2 border-signal bg-marine-tint px-3 py-2 text-small leading-6">
              {index === firstQuote ? <p className="label mb-1 text-signal">{sourceLabel}</p> : null}
              <p>{renderInlines(block.inlines)}</p>
            </blockquote>
          );
        }
        if (block.type === "note") {
          return (
            <p key={index} className="rounded-[1rem] bg-paper-2 px-3 py-2 text-small leading-6 text-ink-2">
              {renderInlines(block.inlines)}
            </p>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const List = block.type === "ul" ? "ul" : "ol";
          return (
            <List key={index} className={block.type === "ul" ? "list-disc space-y-1 pl-5" : "list-decimal space-y-1 pl-5"}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlines(item)}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{renderInlines(block.inlines, true)}</p>;
      })}
    </div>
  );
}

export function parseAnswer(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    if (lines[index]?.trim() === "") {
      index += 1;
      continue;
    }
    const start = index;
    while (index < lines.length && lines[index]?.trim() !== "") index += 1;
    const group = lines.slice(start, index);
    const block = classify(group);
    const previous = blocks.at(-1);
    if (block.type === "ul" && previous?.type === "ul") previous.items.push(...block.items);
    else if (block.type === "ol" && previous?.type === "ol") previous.items.push(...block.items);
    else blocks.push(block);
  }
  return blocks;
}

function classify(group: string[]): Block {
  if (group.every((line) => /^>\s?/.test(line.trim()))) {
    return { type: "quote", inlines: parseInlines(group.map((line) => line.trim().replace(/^>\s?/, "")).join("\n")) };
  }
  if (group.every((line) => /^[-*]\s+/.test(line.trim()))) {
    return { type: "ul", items: group.map((line) => parseInlines(line.trim().replace(/^[-*]\s+/, ""))) };
  }
  if (group.every((line) => /^\d+[.)]\s+/.test(line.trim()))) {
    return { type: "ol", items: group.map((line) => parseInlines(line.trim().replace(/^\d+[.)]\s+/, ""))) };
  }
  const inlines = parseInlines(group.join("\n"));
  return { type: NOTE.test(plain(inlines)) ? "note" : "p", inlines };
}

function parseInlines(source: string): Inline[] {
  const nodes: Inline[] = [];
  let text = "";
  let index = 0;
  const flush = () => {
    if (!text) return;
    nodes.push({ kind: "text", text });
    text = "";
  };
  while (index < source.length) {
    if (source.startsWith("**", index)) {
      const end = source.indexOf("**", index + 2);
      if (end !== -1) {
        flush();
        nodes.push({ kind: "bold", children: parseInlines(source.slice(index + 2, end)) });
        index = end + 2;
        continue;
      }
    }
    if (source[index] === "`") {
      const end = source.indexOf("`", index + 1);
      if (end !== -1) {
        flush();
        nodes.push({ kind: "code", text: source.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    if (source[index] === "*" && source[index + 1] !== "*") {
      const end = source.indexOf("*", index + 1);
      if (end > index + 1) {
        flush();
        nodes.push({ kind: "italic", children: parseInlines(source.slice(index + 1, end)) });
        index = end + 1;
        continue;
      }
    }
    text += source[index];
    index += 1;
  }
  flush();
  return nodes;
}

function plain(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "text" || node.kind === "code") return node.text;
      return plain(node.children);
    })
    .join("");
}

function renderInlines(nodes: Inline[], breaks = false): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.kind === "text") {
      if (!breaks || !node.text.includes("\n")) return node.text;
      const parts = node.text.split("\n");
      return parts.flatMap((part, partIndex) => (partIndex === 0 ? [part] : [<br key={`${index}-${partIndex}`} />, part]));
    }
    if (node.kind === "bold") return <strong key={index}>{renderInlines(node.children)}</strong>;
    if (node.kind === "italic") return <em key={index}>{renderInlines(node.children)}</em>;
    return (
      <code key={index} className="rounded bg-paper-2 px-1 py-0.5 font-mono text-[0.92em]">
        {node.text}
      </code>
    );
  });
}
