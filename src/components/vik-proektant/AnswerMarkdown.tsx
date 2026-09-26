import type { ReactNode } from "react";
import type { Inline, MarkdownBlock } from "@/vik-proektant/comparison/presentation";
import { parseMarkdown } from "@/vik-proektant/comparison/presentation";

export function AnswerMarkdown({ text, mode }: { text: string; mode: "control" | "expert" }) {
  const blocks = parseMarkdown(text, mode);
  return (
    <div className={`max-w-[65ch] break-words text-small text-ink-2 ${mode === "expert" ? "space-y-4" : "space-y-3"}`}>
      {blocks.map((block, index) => (
        <MarkdownBlockView key={index} block={block} expert={mode === "expert"} />
      ))}
    </div>
  );
}

function MarkdownBlockView({ block, expert }: { block: MarkdownBlock; expert: boolean }) {
  if (block.type === "heading") {
    const Tag = block.level === 2 ? "h3" : "h4";
    return <Tag className="text-small font-medium text-pretty text-ink">{block.text}</Tag>;
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag className={block.ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
        {block.items.map((item, index) => (
          <li key={index}>
            <InlineView nodes={item} />
          </li>
        ))}
      </Tag>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l border-line pl-3 text-ink-2">
        <InlineView nodes={block.children} />
      </blockquote>
    );
  }
  if (block.type === "table") {
    return (
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[18rem] border-collapse text-left text-small">
          <thead>
            <tr className="border-b border-line">
              {block.headers.map((header, index) => (
                <th key={`${header}-${index}`} className="px-2 py-2 font-medium text-ink">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, index) => (
              <tr key={index} className="border-b border-line">
                {block.headers.map((_, cell) => (
                  <td key={cell} className="px-2 py-2 align-top text-ink-2">
                    {row[cell] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "code" && expert) {
    return (
      <pre className="overflow-x-auto rounded-2xl bg-paper px-3 py-2 text-meta text-ink">
        <code>{block.text}</code>
      </pre>
    );
  }
  return (
    <p>
      <InlineView nodes={block.type === "code" ? [{ type: "text", text: block.text }] : block.children} />
    </p>
  );
}

function InlineView({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <InlineNode key={index} node={node} />
      ))}
    </>
  );
}

function InlineNode({ node }: { node: Inline }): ReactNode {
  if (node.type === "strong") return <strong className="font-medium text-ink"><InlineView nodes={node.children} /></strong>;
  if (node.type === "em") return <em><InlineView nodes={node.children} /></em>;
  if (node.type === "code") return <code className="rounded bg-paper px-1 py-0.5 text-meta text-ink">{node.text}</code>;
  if (node.type === "link") {
    return (
      <a href={node.href} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-line-strong underline-offset-2">
        {node.text}
      </a>
    );
  }
  return node.text;
}
