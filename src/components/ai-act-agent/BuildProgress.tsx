"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { cn } from "@/lib/cn";
import { Container } from "@/components/layout/Container";

export const BUILD_LEVELS = ["compose", "kit", "download", "chatgpt", "assemble", "validate"] as const;
export type BuildLevel = (typeof BUILD_LEVELS)[number];

/** Reads which build step is currently in view (set by BuildJourney's observer). */
export function useBuildLevel(): { current: number; complete: boolean } {
  const [current, setCurrent] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-build-step]"));
    if (!nodes.length) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let idx = 0;
      nodes.forEach((node, i) => {
        const r = node.getBoundingClientRect();
        if (r.top <= line) idx = i;
      });
      setCurrent(Math.min(idx, BUILD_LEVELS.length - 1));
      // The last level counts as done once its content scrolls past the reading line.
      const lastLevel = nodes[BUILD_LEVELS.length - 1];
      setComplete(lastLevel ? lastLevel.getBoundingClientRect().bottom <= line : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { current, complete };
}

export function BuildProgress({ locale }: { locale: Locale }) {
  const { current, complete } = useBuildLevel();
  const total = BUILD_LEVELS.length;
  const pct = Math.round(((current + 1) / total) * 100);
  const levelNames = copy.buildGame.levels;

  return (
    <div className="build-progress" aria-hidden="true">
      <Container className="py-2.5">
        <div className="flex items-center gap-3">
          <p className="font-mono text-meta tracking-[0.04em] text-ink-3">
            {copy.buildGame.progress[locale]} {Math.min(current + 1, total)}/{total}
          </p>
          <div className="build-progress-track flex-1">
            <div className="build-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <ol className="hidden items-center gap-1.5 md:flex">
            {BUILD_LEVELS.map((level, i) => {
              const done = i < current || (i === current && complete);
              return (
                <li
                  key={level}
                  className="build-level-dot"
                  data-state={done ? "done" : i === current ? "current" : "todo"}
                  title={levelNames[i]?.[locale]}
                >
                  {done ? "✓" : i + 1}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </div>
  );
}

/** Small pill shown at the end of each level once it scrolls into view. */
export function BuildReward({ locale, level, className }: { locale: Locale; level: number; className?: string }) {
  const reward = copy.buildGame.rewards[level];
  if (!reward) return null;
  return (
    <p className={cn("build-reward", className)}>
      <span aria-hidden="true">★</span>
      {reward[locale]}
    </p>
  );
}
