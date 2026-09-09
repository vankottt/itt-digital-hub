import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { ProjectScreenSet, ProjectShot } from "@/content/stories";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Icons";

function BrowserChrome({ url }: { url: string }) {
  const host = url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[#141416] px-4 py-2.5">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </span>
      <span className="min-w-0 flex-1 truncate rounded-full bg-white/10 px-3 py-1 text-center font-mono text-[0.6875rem] tracking-wide text-on-dark-muted">
        {host}
      </span>
    </div>
  );
}

function ShotImage({ shot, locale, sizes, className }: { shot: ProjectShot; locale: Locale; sizes: string; className?: string }) {
  return (
    <Image
      src={shot.src}
      alt={shot.alt[locale]}
      fill
      sizes={sizes}
      className={cn("object-cover object-top", className)}
    />
  );
}

function FramedShot({
  shot,
  locale,
  url,
  sizes,
  className,
}: {
  shot: ProjectShot;
  locale: Locale;
  url: string;
  sizes: string;
  className?: string;
}) {
  if (shot.frame === "phone") {
    return (
      <figure className={cn("mx-auto w-full max-w-[18.5rem]", className)}>
        <div className="rounded-[2rem] bg-ink p-[0.45rem] shadow-[0_28px_80px_rgba(4,14,49,0.22)]">
          <div className="relative aspect-[390/844] overflow-hidden rounded-[1.55rem] bg-[#121214]">
            <ShotImage shot={shot} locale={locale} sizes={sizes} className="object-cover object-top" />
          </div>
        </div>
        <figcaption className="mt-4 text-small text-ink-3">{shot.caption[locale]}</figcaption>
      </figure>
    );
  }

  const ratio = shot.frame === "browser" ? "aspect-[16/10]" : "aspect-[16/11]";
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[1.25rem] bg-[#121214] shadow-[0_28px_80px_rgba(4,14,49,0.16)]">
        {shot.frame === "browser" ? <BrowserChrome url={url} /> : null}
        <div className={cn("relative w-full", ratio)}>
          <ShotImage shot={shot} locale={locale} sizes={sizes} />
        </div>
      </div>
      <figcaption className="mt-4 text-small text-ink-3">{shot.caption[locale]}</figcaption>
    </figure>
  );
}

export function ProjectHeroShot({
  screens,
  locale,
}: {
  screens: ProjectScreenSet;
  locale: Locale;
}) {
  return (
    <FramedShot
      shot={screens.hero}
      locale={locale}
      url={screens.liveUrl[locale]}
      sizes="(min-width: 1024px) 1120px, 100vw"
    />
  );
}

export function ProjectScreenGallery({
  screens,
  locale,
}: {
  screens: ProjectScreenSet;
  locale: Locale;
}) {
  return (
    <div className="grid gap-8">
      <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(11rem,0.75fr)] md:gap-10">
        {screens.shots.map((shot) => (
          <FramedShot
            key={shot.src}
            shot={shot}
            locale={locale}
            url={screens.liveUrl[locale]}
            sizes={shot.frame === "phone" ? "320px" : "(min-width: 768px) 420px, 100vw"}
          />
        ))}
      </div>
      <a
        href={screens.liveUrl[locale]}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex w-fit items-center gap-2 font-sans text-small font-medium text-ink transition-colors duration-150 hover:text-marine"
      >
        <span className="underline decoration-line-strong underline-offset-[4px] transition-colors duration-150 group-hover:decoration-amber">
          {screens.liveLabel[locale]}
        </span>
        <ArrowRight className="shrink-0 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
