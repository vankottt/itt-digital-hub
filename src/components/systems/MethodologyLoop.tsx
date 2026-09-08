"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "./InView";

export interface LoopStage {
  code: string;
  short: string;
  title: string;
  body: string;
}

/**
 * Ten stages as a closed loop. Desktop: two rows of five (01–05 left→right,
 * 06–10 right→left) joined on the right, with a dashed amber return on the
 * left; stages are buttons revealing their description. Mobile: a numbered
 * rail listing every stage with its description (no interaction required).
 */
export function MethodologyLoop({
  stages,
  tone = "on-dark",
  labels,
  defaultActive = 0,
  mobile = "rail",
}: {
  stages: LoopStage[];
  tone?: "ink" | "on-dark";
  labels: { stage: string; loopNote: string; structure?: string; loop?: string };
  defaultActive?: number;
  /** "rail" lists all stages; "compact" is homepage-only (one open description); "none" when the page already lists them. */
  mobile?: "rail" | "compact" | "none";
}) {
  const [active, setActive] = useState(defaultActive);
  const [pinned, setPinned] = useState(false);
  const [playhead, setPlayhead] = useState<number | "idle" | "done">("idle");
  const panelId = useId();
  const dark = tone === "on-dark";
  const top = stages.slice(0, 5);
  const bottom = stages.slice(5, 10);
  const { ref, ready, visible } = useInView();
  const cycling = visible && ready && !pinned && playhead !== "done";
  const highlighted = typeof playhead === "number" ? playhead : cycling ? 0 : active;
  const current = stages[active] ?? stages[0]!;

  useEffect(() => {
    if (!visible || !ready || pinned) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= stages.length) {
        window.clearInterval(id);
        setPlayhead("done");
        return;
      }
      setPlayhead(i);
    }, 320);
    return () => window.clearInterval(id);
  }, [visible, ready, pinned, stages.length]);

  const select = (index: number) => {
    setPinned(true);
    setPlayhead("done");
    setActive(index);
  };

  const lineColor = dark ? "bg-on-dark/35" : "bg-line-strong";
  const arrowColor = dark ? "text-on-dark/60" : "text-ink-3";

  /**
   * Adjacent-column segment: from this circle's far rim, across `gap-x-4`,
   * to the next circle's near rim. Circles are `h-10` (2.5rem) in a 5-col grid.
   */
  const segmentFromRim = {
    inset: "calc(50% + 1.25rem)",
    length: "calc(100% + 1rem - 2.5rem)",
  };

  const arrowHead = (direction: "right" | "left") => (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2",
        arrowColor,
        direction === "right" ? "right-[calc(100%-1px)]" : "left-[calc(100%-1px)] rotate-180",
      )}
    >
      <path d="M0 0.5 7.5 4 0 7.5Z" fill="currentColor" />
    </svg>
  );

  const circleClass = (i: number) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[0.75rem] tracking-[0.04em] transition-colors duration-150",
      i === highlighted
        ? "border-amber bg-amber text-marine"
        : dark
          ? "border-on-dark/50 bg-marine text-on-dark group-hover:border-on-dark"
          : "border-ink bg-paper text-ink group-hover:border-marine",
    );

  const labelClass = (i: number) =>
    cn(
      "text-[0.8125rem] leading-[1.3] font-medium transition-colors duration-150",
      i === highlighted ? (dark ? "text-on-dark" : "text-ink") : dark ? "text-on-dark-muted group-hover:text-on-dark" : "text-ink-2 group-hover:text-ink",
    );

  return (
    <div ref={ref} className={cn(ready && "js-ready", visible && "is-in-view")}>
      {/* Desktop loop */}
      <div className="hidden lg:block">
        {/* Row 1: labels above, circles at the bottom edge */}
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 grid h-10 grid-cols-5 items-center gap-x-4"
            aria-hidden="true"
          >
            {top.map((s, i) => (
              <div key={s.code} className="relative h-px">
                {i < 4 ? (
                  <div
                    className={cn("loop-segment absolute top-0 h-px", lineColor)}
                    style={{ left: segmentFromRim.inset, width: segmentFromRim.length, ["--seg-delay" as string]: `${i * 0.12}s` }}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div className="relative z-[1] grid grid-cols-5 gap-x-4" role="group" aria-label={labels.stage}>
            {top.map((s, i) => (
              <button
                key={s.code}
                type="button"
                aria-pressed={i === active}
                aria-controls={panelId}
                onClick={() => select(i)}
                className="group relative flex flex-col items-center justify-end text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
              >
                <span className={cn("mb-3 max-w-[11rem]", labelClass(i))}>{s.short}</span>
                <span className="relative inline-flex">
                  {i > 0 ? arrowHead("right") : null}
                  <span className={cn("relative z-[1]", circleClass(i))}>{s.code}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Verticals: same 5-col grid so they hit circle centres, not 10%/90% */}
        <div className="relative h-14" aria-hidden="true">
          <div className="grid h-full grid-cols-5 gap-x-4">
            <div className="relative">
              <div
                className="loop-segment-y loop-segment-y-up absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                style={{
                  ["--seg-delay" as string]: "1.08s",
                  backgroundImage: "linear-gradient(to bottom, var(--color-amber) 55%, transparent 55%)",
                  backgroundSize: "1px 7px",
                }}
              />
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-amber"
              >
                <path d="M0 0.5 7.5 4 0 7.5Z" fill="currentColor" />
              </svg>
              <span
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-y-1/2 pl-3.5 font-mono text-[0.6875rem] tracking-[0.06em] whitespace-nowrap uppercase",
                  dark ? "text-on-dark-muted" : "text-ink-3",
                )}
              >
                {labels.loopNote}
              </span>
            </div>
            <div className="col-span-3" />
            <div className="relative">
              <div
                className={cn("loop-segment-y absolute inset-y-0 left-1/2 w-px -translate-x-1/2", lineColor)}
                style={{ ["--seg-delay" as string]: "0.48s" }}
              />
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-90", arrowColor)}
              >
                <path d="M0 0.5 7.5 4 0 7.5Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 2: circles at the top edge, labels below; visual order right→left */}
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 grid h-10 grid-cols-5 items-center gap-x-4"
            dir="rtl"
            aria-hidden="true"
          >
            {bottom.map((s, j) => (
              <div key={s.code} className="relative h-px">
                {j < 4 ? (
                  <div
                    className={cn("loop-segment loop-segment-rtl absolute top-0 h-px", lineColor)}
                    style={{ right: segmentFromRim.inset, width: segmentFromRim.length, ["--seg-delay" as string]: `${0.6 + j * 0.12}s` }}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div className="relative z-[1] grid grid-cols-5 gap-x-4" dir="rtl" role="group" aria-label={labels.stage}>
            {bottom.map((s, j) => {
              const i = j + 5;
              return (
                <button
                  key={s.code}
                  type="button"
                  dir="ltr"
                  aria-pressed={i === active}
                  aria-controls={panelId}
                  onClick={() => select(i)}
                  className="group relative flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                >
                  <span className="relative inline-flex">
                    {j > 0 ? arrowHead("left") : null}
                    <span className={cn("relative z-[1]", circleClass(i))}>{s.code}</span>
                  </span>
                  <span className={cn("mt-3 max-w-[11rem]", labelClass(i))}>{s.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div
          id={panelId}
          role="region"
          aria-live={pinned ? "polite" : "off"}
          className={cn("mt-10 grid gap-4 border-t pt-6 md:grid-cols-12", dark ? "border-on-dark/20" : "border-line")}
        >
          <p className={cn("md:col-span-3", dark ? "label-dark" : "label")}>
            {labels.stage} {current.code}
          </p>
          <div className="md:col-span-9">
            <h3 className={cn("font-serif text-h3", dark ? "text-on-dark" : "text-ink")}>{current.title}</h3>
            <p className={cn("mt-2 max-w-2xl text-body", dark ? "text-on-dark-muted" : "text-ink-2")}>{current.body}</p>
          </div>
        </div>
      </div>

      {/* Compact homepage mobile: stage index without all bodies at once. */}
      {mobile === "compact" ? (
        <div className="lg:hidden">
          <ol className={cn("divide-y", dark ? "divide-on-dark/20 border-y border-on-dark/20" : "divide-line border-y border-line")}>
            {stages.map((s, i) => {
              const loop = i === stages.length - 1;
              const kind = loop ? labels.loop : labels.structure;
              return (
                <li key={s.code}>
                  <button
                    type="button"
                    aria-pressed={i === active}
                    aria-controls={`${panelId}-compact`}
                    onClick={() => select(i)}
                    className="flex w-full items-baseline gap-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  >
                    <span className={cn("font-mono text-[0.75rem] tracking-[0.04em]", i === active ? "text-amber" : dark ? "text-on-dark-muted" : "text-ink-3")}>
                      {s.code}
                    </span>
                    <span className={cn("flex-1 text-small font-medium", i === active ? (dark ? "text-on-dark" : "text-ink") : dark ? "text-on-dark-muted" : "text-ink-2")}>
                      {s.short}
                    </span>
                    {kind ? (
                      <span className={cn("font-mono text-[0.6875rem] uppercase tracking-[0.06em]", dark ? "text-on-dark-muted" : "text-ink-3")}>
                        {loop ? "↺ " : ""}
                        {kind}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <div
            id={`${panelId}-compact`}
            role="region"
            aria-live="polite"
            className={cn("mt-5 border-t pt-5", dark ? "border-on-dark/20" : "border-line")}
          >
            <p className={dark ? "label-dark" : "label"}>
              {labels.stage} {current.code}
            </p>
            <h3 className={cn("mt-2 font-serif text-h4", dark ? "text-on-dark" : "text-ink")}>{current.title}</h3>
            <p className={cn("mt-2 text-small", dark ? "text-on-dark-muted" : "text-ink-2")}>{current.body}</p>
          </div>
        </div>
      ) : null}

      {/* Mobile rail */}
      {mobile === "rail" ? (
      <ol className={cn("lg:hidden ml-3.5 border-l", dark ? "border-on-dark/30" : "border-line-strong")}>
        {stages.map((s, i) => (
          <li key={s.code} className="relative pb-6 pl-8 last:pb-0">
            <span
              className={cn(
                "absolute -left-[13px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border font-mono text-[0.6875rem]",
                i === stages.length - 1 ? "border-amber bg-amber text-marine" : dark ? "border-on-dark/50 bg-marine text-on-dark" : "border-ink bg-paper text-ink",
              )}
            >
              {s.code}
            </span>
            <h3 className={cn("text-h4 font-serif", dark ? "text-on-dark" : "text-ink")}>{s.title}</h3>
            <p className={cn("mt-1.5 text-small", dark ? "text-on-dark-muted" : "text-ink-2")}>{s.body}</p>
          </li>
        ))}
        <li className={cn("pl-8 pt-2 font-mono text-[0.6875rem] uppercase tracking-[0.06em]", dark ? "text-on-dark-muted" : "text-ink-3")}>↺ {labels.loopNote}</li>
      </ol>
      ) : mobile === "none" ? (
        <p className={cn("lg:hidden font-mono text-[0.6875rem] uppercase tracking-[0.06em]", dark ? "text-on-dark-muted" : "text-ink-3")}>
          {stages.map((s) => s.code).join(" → ")} ↺
        </p>
      ) : null}
    </div>
  );
}
