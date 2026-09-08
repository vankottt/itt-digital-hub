import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * A linear sequence of stages (value chain, transformation path, validation
 * loop). Horizontal flex-wrap by default; `direction="vertical"` renders a
 * step ladder with downward connectors. `loopLabel` adds a return note.
 */
export function Chain({
  items,
  frameLabel,
  loopLabel,
  tone = "ink",
  className,
  numbered = false,
  direction = "horizontal",
}: {
  items: readonly string[];
  frameLabel?: string;
  loopLabel?: string;
  tone?: "ink" | "on-dark";
  className?: string;
  numbered?: boolean;
  direction?: "horizontal" | "vertical";
}) {
  const dark = tone === "on-dark";
  const pill = cn(
    "inline-flex min-h-10 items-center gap-2.5 rounded-ctrl border px-3 py-1.5 text-small font-medium",
    dark ? "border-on-dark/40 bg-marine text-on-dark" : "border-ink bg-paper text-ink",
  );
  const num = (i: number) =>
    numbered ? (
      <span className={cn("font-mono text-[0.6875rem] tracking-[0.06em]", dark ? "text-on-dark-muted" : "text-ink-3")}>{String(i + 1).padStart(2, "0")}</span>
    ) : null;

  return (
    <div className={cn("border p-4 sm:p-5", dark ? "border-on-dark/20" : "border-line", className)}>
      {frameLabel ? <p className={cn(dark ? "label-dark" : "label", "mb-4")}>{frameLabel}</p> : null}

      {direction === "vertical" ? (
        <ol className="flex flex-col">
          {items.map((item, i) => (
            <li key={item} className="flex flex-col items-start">
              <span className={pill}>
                {num(i)}
                {item}
              </span>
              {i < items.length - 1 ? (
                <span className="ml-5 flex h-7 flex-col items-center justify-center" aria-hidden="true">
                  <span className={cn("h-4 w-px", dark ? "bg-on-dark/40" : "bg-line-strong")} />
                  <ArrowRight className={cn("-mt-0.5 rotate-90", dark ? "text-on-dark-muted" : "text-ink-3")} size={12} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="flex flex-wrap items-stretch gap-y-3">
          {items.map((item, i) => (
            <li key={item} className="flex items-center">
              <span className={pill}>
                {num(i)}
                {item}
              </span>
              {i < items.length - 1 ? (
                <ArrowRight className={cn("mx-1.5 shrink-0", dark ? "text-on-dark-muted" : "text-ink-3")} aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {loopLabel ? (
        <p className={cn("mt-3 flex items-center gap-2 text-meta", dark ? "text-on-dark-muted" : "text-ink-3")}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
            <path d="M16 1v5.5H2M5 3 2 6.5 5 10" stroke="var(--color-amber)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
          </svg>
          {loopLabel}
        </p>
      ) : null}
    </div>
  );
}
