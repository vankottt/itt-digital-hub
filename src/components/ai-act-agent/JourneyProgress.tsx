"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { Container } from "@/components/layout/Container";

export const BUILD_LEVELS = ["compose", "kit", "download", "chatgpt", "assemble", "validate"] as const;
export type BuildLevel = (typeof BUILD_LEVELS)[number];

function scrollToBuildStep(step: BuildLevel) {
  const el = document.querySelector<HTMLElement>(`[data-build-step="${step}"]`);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
}

/** Reads which of the six build steps is currently in view. */
export function useBuildLevel(): { current: number; complete: boolean } {
  const [current, setCurrent] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const nodes = BUILD_LEVELS.map((id) => document.querySelector<HTMLElement>(`[data-build-step="${id}"]`)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (!nodes.length) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let idx = 0;
      nodes.forEach((node, i) => {
        if (node.getBoundingClientRect().top <= line) idx = i;
      });
      setCurrent(idx);
      const last = nodes[nodes.length - 1];
      setComplete(last ? last.getBoundingClientRect().bottom <= line : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { current, complete };
}

/** Compact sticky 1–6 navigation, matching the split-screen mockups. */
export function RouteProgress({ locale }: { locale: Locale }) {
  const { current, complete } = useBuildLevel();
  const total = BUILD_LEVELS.length;
  const shown = Math.min(current + 1, total);

  return (
    <div className="build-progress">
      <Container className="flex items-center justify-end gap-3 py-1.5">
        <nav className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label={copy.journey.progress[locale]}>
          <p className="sr-only">
            {copy.journey.progress[locale]} {shown} / {total}
          </p>
          <p className="shrink-0 font-mono text-meta tracking-[0.06em] text-ink-3" aria-hidden="true">
            {shown} / {total}
          </p>
          <ol className="flex list-none items-center gap-0.5 sm:gap-1">
            {BUILD_LEVELS.map((level, i) => {
              const done = i < current || (i === current && complete);
              const active = i === current && !complete;
              const n = i + 1;
              return (
                <li key={level}>
                  <button
                    type="button"
                    className="build-step"
                    data-state={done ? "done" : active ? "current" : "todo"}
                    aria-label={`${copy.journey.goToStep[locale]} ${n}`}
                    aria-current={active ? "step" : undefined}
                    onClick={() => scrollToBuildStep(level)}
                  >
                    {n}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
