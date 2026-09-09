import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import type { Project } from "@/content/types";
import type { StoryCover } from "@/content/stories";
import { t } from "@/content/messages";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";
import { StatusLabel } from "./ProjectMeta";

function Cover({ cover, locale }: { cover?: StoryCover; locale: Locale }) {
  if (cover?.kind === "photo") {
    return (
      <Image
        src={cover.src}
        alt={cover.alt[locale]}
        fill
        sizes="(min-width: 1024px) 38vw, (min-width: 768px) 55vw, 90vw"
        className="object-cover object-center transition-transform duration-500 ease-out-soft motion-safe:group-hover:scale-[1.04]"
      />
    );
  }

  return <div className="absolute inset-0 bg-marine" />;
}

export function StoryCard({
  project,
  locale,
  cover,
}: {
  project: Project;
  locale: Locale;
  cover?: StoryCover;
}) {
  const m = t(locale);
  const url = href(locale, "projects", project.slug);

  return (
    <article className="h-full">
      <Link
        href={url}
        className="story-card group flex h-full flex-col no-underline outline-offset-4"
      >
        <div className="relative isolate aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-paper-2">
          <Cover cover={cover} locale={locale} />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-200",
              cover?.kind === "photo" && cover.overlay === "light"
                ? "bg-gradient-to-t from-marine/45 via-transparent to-transparent opacity-90 group-hover:opacity-100"
                : "bg-gradient-to-t from-marine/70 via-marine/10 to-transparent opacity-80 group-hover:opacity-100",
            )}
          />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-on-dark">
            <span className="font-sans text-small font-medium">{m.viewMore}</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(4,14,49,0.18)] transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </span>
          </span>
        </div>
        <p className="mt-5">
          <StatusLabel status={project.status} locale={locale} />
        </p>
        <h3 className="mt-3 text-h3 text-pretty text-ink transition-colors duration-150 group-hover:text-signal">
          {project.title[locale]}
        </h3>
        <p className="mt-2 line-clamp-2 text-small text-ink-2">{project.standfirst[locale]}</p>
      </Link>
    </article>
  );
}
