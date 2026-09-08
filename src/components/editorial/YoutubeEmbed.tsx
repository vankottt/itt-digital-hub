import type { Locale } from "@/lib/i18n";
import { t } from "@/content/messages";
import { cn } from "@/lib/cn";
import { youtubeEmbedSrc, youtubeWatchUrl, type YouTubeClip } from "@/lib/youtube";

/**
 * Hairline 16:9 YouTube frame for insight body blocks.
 * Privacy-enhanced host, no autoplay query, caption links out to YouTube.
 */
export function YoutubeEmbed({
  clip,
  locale,
  className,
}: {
  clip: YouTubeClip;
  locale: Locale;
  className?: string;
}) {
  const m = t(locale);
  const watchHref = youtubeWatchUrl(clip);

  return (
    <figure className={cn("overflow-hidden border border-line bg-paper-3", className)}>
      <div className="relative aspect-video w-full">
        <iframe
          src={youtubeEmbedSrc(clip)}
          title={m.youtubeTitle}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="border-t border-line px-4 py-3 text-small text-ink-3">
        <a href={watchHref} rel="noopener noreferrer" target="_blank">
          {m.youtubeWatch}
        </a>
      </figcaption>
    </figure>
  );
}
