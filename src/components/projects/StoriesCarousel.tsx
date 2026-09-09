"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/content/types";
import { storyCovers } from "@/content/stories";
import { t } from "@/content/messages";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { StoryCard } from "./StoryCard";

export function StoriesCarousel({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const m = t(locale);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState(false);
  const labelId = useId();
  const reduceMotion = usePrefersReducedMotion();

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setOverflow(el.scrollWidth > el.clientWidth + 12);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, projects.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > li");
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 24;
    const width = card?.getBoundingClientRect().width ?? el.clientWidth * 0.8;
    el.scrollBy({ left: direction * (width + gap), behavior: reduceMotion ? "auto" : "smooth" });
  };

  if (!projects.length) return null;

  return (
    <div className="stories-carousel">
      <p id={labelId} className="sr-only">
        {m.storiesCarousel}
      </p>
      {overflow ? (
        <div className="mb-6 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink text-ink transition-colors duration-150 hover:border-signal hover:text-signal"
            onClick={() => scrollByCard(-1)}
            aria-label={m.storiesPrevious}
          >
            <ArrowRight className="rotate-180" size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink text-ink transition-colors duration-150 hover:border-signal hover:text-signal"
            onClick={() => scrollByCard(1)}
            aria-label={m.storiesNext}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      ) : null}
      <ul
        ref={scrollerRef}
        aria-labelledby={labelId}
        tabIndex={overflow ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollByCard(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollByCard(-1);
          }
        }}
        className={cn("news-strip stories-strip flex gap-6 overflow-x-auto pb-2")}
      >
        {projects.map((project) => (
          <li key={project.slug} className="news-strip-item">
            <StoryCard project={project} locale={locale} cover={storyCovers[project.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
