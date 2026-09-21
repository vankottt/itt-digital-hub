"use client";

import type { Locale } from "@/lib/i18n";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { Container } from "@/components/layout/Container";
import { PixelRobot } from "./PixelRobot";
import { useBuildLevel, BUILD_LEVELS } from "./BuildProgress";

function scrollToStep(step: string) {
  document.querySelector(`[data-build-step='${step}']`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Game-style opening for the build journey: pixel robot, level badge,
 * progress bar and mission CTAs. The sticky BuildProgress below it and the
 * per-level rewards stay untouched.
 */
export function BuildGameHero({ locale }: { locale: Locale }) {
  const { current } = useBuildLevel();
  const total = BUILD_LEVELS.length;
  const pct = Math.round(((current + 1) / total) * 100);
  const c = copy.buildGame.hero;

  return (
    <section className="pixel-hero text-on-dark" data-surface="dark" aria-labelledby="build-game-title">
      <Container className="py-14 md:py-20">
        <div className="pixel-frame mx-auto max-w-4xl bg-marine-2/60 px-6 py-10 backdrop-blur-sm md:px-12 md:py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="inline-block border-2 border-signal-2 px-3 py-1 font-mono text-meta font-medium uppercase tracking-[0.2em] text-signal-2">
                {c.badge[locale]}
              </p>
              <h1
                id="build-game-title"
                className="mt-6 font-sans text-[2rem] font-bold uppercase leading-[1.15] tracking-[0.04em] text-on-dark md:text-[2.75rem]"
              >
                {c.title[locale]}
              </h1>
              <p className="mt-4 font-mono text-small uppercase tracking-[0.18em] text-on-dark-muted">
                {c.subtitle[locale]}
              </p>

              <div className="mt-8">
                <div className="flex items-center justify-between font-mono text-meta uppercase tracking-[0.14em] text-on-dark-muted">
                  <span>{c.progress[locale]}</span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-2 h-3 border border-on-dark/25 bg-marine p-0.5">
                  <div className="h-full bg-signal transition-[width] duration-500 ease-out-soft" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" onClick={() => scrollToStep("compose")} className="btn-pixel btn-pixel-primary">
                  {c.start[locale]}
                </button>
                <button type="button" onClick={() => scrollToStep("kit")} className="btn-pixel btn-pixel-ghost">
                  {c.kit[locale]}
                </button>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <PixelRobot className="pixel-robot w-40 md:w-56" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
