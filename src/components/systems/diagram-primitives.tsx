import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared SVG primitives for the drafting diagram grammar. */

export type Tone = "ink" | "on-dark";

export function ArrowDefs({ id, tone }: { id: string; tone: Tone }) {
  const color = tone === "ink" ? "var(--color-ink-2)" : "var(--color-on-dark-muted)";
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0.5 7.5 4 0 7.5Z" fill={color} />
      </marker>
      <marker id={`${id}-arrow-amber`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0.5 7.5 4 0 7.5Z" fill="var(--color-amber)" />
      </marker>
    </defs>
  );
}

export function Edge({
  d,
  id,
  tone,
  dashed = false,
  amber = false,
  draw = false,
  fade = false,
  delay = 0,
}: {
  d: string;
  id: string;
  tone: Tone;
  dashed?: boolean;
  amber?: boolean;
  /** Solid stroke draw-in. Do not combine with `dashed` (dasharray conflict). */
  draw?: boolean;
  fade?: boolean;
  delay?: number;
}) {
  const stroke = amber ? "var(--color-amber)" : tone === "ink" ? "var(--color-ink-2)" : "var(--color-on-dark-muted)";
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth="1.1"
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={`url(#${id}-arrow${amber ? "-amber" : ""})`}
      className={cn(draw && "draw-path", fade && "draw-fade")}
      pathLength={draw ? 1 : undefined}
      style={{ ["--draw-delay" as string]: `${delay}s` }}
    />
  );
}

/**
 * A rectangular node with a mono code and up to two label lines.
 */
export function Node({
  x,
  y,
  w = 156,
  h = 56,
  code,
  lines,
  tone,
  emphasis = false,
  fill = "paper",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  code?: string;
  lines: string[];
  tone: Tone;
  emphasis?: boolean;
  fill?: "paper" | "none";
}) {
  const dark = tone === "on-dark";
  const stroke = emphasis ? "var(--color-amber)" : dark ? "var(--color-on-dark-muted)" : "var(--color-ink)";
  const text = dark ? "var(--color-on-dark)" : "var(--color-ink)";
  const codeColor = dark ? "var(--color-on-dark-muted)" : "var(--color-ink-3)";
  const bg = fill === "none" ? "none" : dark ? "var(--color-marine)" : "var(--color-paper)";
  const twoLines = lines.length > 1;
  const l1 = twoLines ? y + 30 : y + h / 2 + 5;
  const l2 = y + 44;
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx="2" fill={bg} stroke={stroke} strokeWidth={emphasis ? 1.4 : 1} />
      {code ? (
        <text x={x + 12} y={y + 15} fill={codeColor} fontSize="9.5" className="font-mono" letterSpacing="0.06em">
          {code}
        </text>
      ) : null}
      <text x={x + 12} y={code ? l1 : l1} fill={text} fontSize="12.5" fontWeight="500" className="font-sans">
        {lines[0]}
      </text>
      {twoLines ? (
        <text x={x + 12} y={l2} fill={text} fontSize="12.5" fontWeight="500" className="font-sans">
          {lines[1]}
        </text>
      ) : null}
      {emphasis ? <circle cx={x + w - 12} cy={y + 12} r="3" fill="var(--color-amber)" /> : null}
    </g>
  );
}

/** Wrapper adding role="img" semantics and a visible caption. */
export function Figure({
  title,
  desc,
  caption,
  children,
  className,
  tone = "ink",
  grid = true,
}: {
  title: string;
  desc: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: Tone;
  grid?: boolean;
}) {
  return (
    <figure className={cn("m-0", className)}>
      <div
        className={cn(
          "border p-3 sm:p-4",
          tone === "ink" ? "border-line" : "border-on-dark/20",
          grid && (tone === "ink" ? "drafting-grid" : "drafting-grid-dark"),
        )}
        role="img"
        aria-label={`${title}. ${desc}`}
      >
        {children}
      </div>
      {caption ? (
        <figcaption className={cn("mt-3 text-meta", tone === "ink" ? "text-ink-3" : "text-on-dark-muted")}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}
