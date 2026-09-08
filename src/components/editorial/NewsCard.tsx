import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Insight } from "@/content/types";
import { t } from "@/content/messages";
import { href, type RouteKey } from "@/lib/paths";
import { formatSourceDate } from "@/lib/format-source-date";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";
import type { NewsCardMedia } from "@/lib/news-presentation";
import { NewsFallbackMedia } from "./NewsFallbackMedia";

export function NewsCard({
  insight,
  locale,
  media,
  headingLevel = 3,
  variant = "tile",
  channel = "news",
  className,
}: {
  insight: Insight;
  locale: Locale;
  media?: NewsCardMedia | null;
  headingLevel?: 2 | 3;
  variant?: "tile" | "row";
  channel?: Extract<RouteKey, "insights" | "news">;
  className?: string;
}) {
  const m = t(locale);
  const H = headingLevel === 2 ? "h2" : "h3";
  const dated = insight.date ? formatSourceDate(insight.date, locale) : "";
  const url = href(locale, channel, insight.slug);
  const typeLabel = channel === "insights" ? m.analysisItem : m.newsItem;
  const row = variant === "row";

  return (
    <article className={cn("h-full", className)}>
      <Link
        href={url}
        className={cn(
          "news-card group flex h-full no-underline outline-offset-4 focus-visible:outline-2 focus-visible:outline-amber",
          row ? "flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-8" : "flex-col",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden border border-line",
            media?.contain ? "bg-paper-3" : "bg-paper-2",
            row ? "aspect-[16/10] sm:aspect-auto sm:w-[min(18rem,42%)] sm:shrink-0" : "aspect-[16/10]",
          )}
        >
          {media ? (
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes={row ? "(min-width: 640px) 288px, 100vw" : "(min-width: 1024px) 32vw, (min-width: 768px) 48vw, 90vw"}
              className={
                media.contain
                  ? "object-contain"
                  : "object-cover transition-transform duration-200 ease-out-soft motion-safe:group-hover:scale-[1.02]"
              }
            />
          ) : (
            <NewsFallbackMedia label={typeLabel} className="min-h-0 border-0" />
          )}
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col", row ? "sm:py-1" : "border border-t-0 border-line px-5 py-5")}>
          <p className="label">
            {typeLabel}
            {dated ? ` · ${dated}` : ""}
          </p>
          <H className="mt-3 text-h3 text-pretty text-ink transition-colors duration-150 group-hover:text-marine">
            {insight.title[locale]}
          </H>
          <p className="mt-3 line-clamp-3 text-small text-ink-2">{insight.summary[locale]}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 font-sans text-small font-medium text-ink">
            <span className="underline decoration-line-strong underline-offset-[4px] transition-colors duration-150 group-hover:decoration-amber">
              {m.readMore}
            </span>
            <ArrowRight className="shrink-0 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
