import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { ArrowRight } from "@/components/ui/Icons";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

export function ProductChrome({
  locale,
  title,
  aside,
  tone = "paper",
}: {
  locale: Locale;
  title: string;
  aside?: string;
  tone?: "paper" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("border-b", dark ? "border-on-dark/15" : "border-line")}>
      <Container className="flex flex-col gap-3 py-4 md:py-5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0">
          <Link
            href={href(locale, "ai-act-agent")}
            className={cn(
              "group inline-flex items-center gap-2 font-sans text-small font-medium transition-colors duration-150",
              dark ? "text-on-dark hover:text-on-dark" : "text-ink hover:text-marine",
            )}
          >
            <ArrowRight className="shrink-0 rotate-180 transition-transform duration-200 ease-out-soft motion-safe:group-hover:-translate-x-0.5" />
            <span
              className={cn(
                "underline underline-offset-[4px]",
                dark ? "decoration-on-dark/40 group-hover:decoration-amber" : "decoration-line-strong group-hover:decoration-amber",
              )}
            >
              {copy.backToChoice[locale]}
            </span>
          </Link>
          <p className={cn("mt-3 text-h3 text-pretty", dark ? "text-on-dark" : "text-ink")}>{title}</p>
        </div>
        {aside ? <p className={cn("max-w-[36ch] text-meta", dark ? "text-on-dark-muted" : "text-ink-3")}>{aside}</p> : null}
      </Container>
    </div>
  );
}
