"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Insight } from "@/content/types";
import { t } from "@/content/messages";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { carouselNavVisible, type NewsCardMedia } from "@/lib/news-presentation";
import { NewsCard } from "./NewsCard";

export function NewsCarousel({
  insights,
  locale,
  media,
  className,
}: {
  insights: Insight[];
  locale: Locale;
  media: Record<string, NewsCardMedia | null>;
  className?: string;
}) {
  const m = t(locale);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState(false);
  const labelId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const showNav = carouselNavVisible(insights.length) && overflow;

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
  }, [measure, insights.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > li");
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 24;
    const width = card?.getBoundingClientRect().width ?? el.clientWidth * 0.8;
    el.scrollBy({ left: direction * (width + gap), behavior: reduceMotion ? "auto" : "smooth" });
  };

  if (!insights.length) return null;

  const count = insights.length;

  return (
    <div className={cn("news-carousel", className)}>
      <p id={labelId} className="sr-only">
        {m.newsCarousel}
      </p>
      {showNav ? (
        <div className="mb-5 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-ctrl border border-ink text-ink transition-colors duration-150 hover:border-marine hover:text-marine"
            onClick={() => scrollByCard(-1)}
            aria-label={m.newsPrevious}
          >
            <ArrowRight className="rotate-180" size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-ctrl border border-ink text-ink transition-colors duration-150 hover:border-marine hover:text-marine"
            onClick={() => scrollByCard(1)}
            aria-label={m.newsNext}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      ) : null}
      <ul
        ref={scrollerRef}
        aria-labelledby={labelId}
        tabIndex={showNav ? 0 : undefined}
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
        className={cn("news-strip flex gap-6 overflow-x-auto pb-2", count === 1 && "news-strip-single")}
      >
        {insights.map((insight) => (
          <li key={insight.slug} className="news-strip-item">
            <NewsCard insight={insight} locale={locale} media={media[insight.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
