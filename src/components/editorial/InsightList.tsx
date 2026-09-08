import type { Locale } from "@/lib/i18n";
import { type RouteKey } from "@/lib/paths";
import type { Insight } from "@/content/types";
import { cn } from "@/lib/cn";
import type { NewsCardMedia } from "@/lib/news-presentation";
import { NewsCard } from "./NewsCard";

/** Editorial row list for Insights or News. Same card grammar; channel sets the type label and route. */
export function InsightList({
  insights,
  locale,
  headingLevel = 3,
  className,
  channel = "insights",
  media,
}: {
  insights: Insight[];
  locale: Locale;
  headingLevel?: 2 | 3;
  className?: string;
  channel?: Extract<RouteKey, "insights" | "news">;
  media?: Record<string, NewsCardMedia | null>;
}) {
  return (
    <ol className={cn("grid gap-10", className)}>
      {insights.map((n) => (
        <li key={n.slug}>
          <NewsCard
            insight={n}
            locale={locale}
            media={media?.[n.slug]}
            headingLevel={headingLevel}
            variant="row"
            channel={channel}
          />
        </li>
      ))}
    </ol>
  );
}
