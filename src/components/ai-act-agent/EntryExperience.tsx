"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { trackAiActEvent } from "@/lib/ai-act/analytics";
import { Container } from "@/components/layout/Container";
import { ArrowRight } from "@/components/ui/Icons";
import { useAiActSession } from "./AiActSessionProvider";

export function EntryExperience({ locale }: { locale: Locale }) {
  const { update } = useAiActSession();

  useEffect(() => {
    trackAiActEvent("ai_act_page_view", { locale, surface: "entry" });
  }, [locale]);

  return (
    <section className="hero-atmosphere text-on-dark" data-surface="dark">
      <Container className="flex min-h-svh flex-col justify-start pt-24 pb-10 md:justify-center md:pt-32 md:pb-20">
        <p className="label-dark">{copy.provenance[locale]}</p>
        <h1 className="mt-4 max-w-[18ch] text-hero text-balance hyphens-none font-sans font-normal text-on-dark md:max-w-[22ch]">
          {copy.headline[locale]}
        </h1>
        <p className="mt-5 max-w-[44ch] text-lead font-light text-on-dark-muted">{copy.support[locale]}</p>
        <p className="mt-3 max-w-[46ch] text-small text-on-dark-muted">{copy.descriptor[locale]}</p>
        <p className="mt-6 max-w-[28ch] text-h3 text-pretty text-on-dark">{copy.concept[locale]}</p>

        <div className="mt-8 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-5">
          <JourneyCard
            href={href(locale, "ai-act-agent", "use")}
            kicker={copy.paths.use.hint[locale]}
            title={copy.paths.use.title[locale]}
            lead={copy.paths.use.lead[locale]}
            visual="use"
            onSelect={() => {
              update({ journey: "use" });
              trackAiActEvent("ai_act_path_selected", { locale, path: "use" });
            }}
          />
          <JourneyCard
            href={href(locale, "ai-act-agent", "build")}
            kicker={copy.paths.build.hint[locale]}
            title={copy.paths.build.title[locale]}
            lead={copy.paths.build.lead[locale]}
            visual="build"
            onSelect={() => {
              update({ journey: "build" });
              trackAiActEvent("ai_act_path_selected", { locale, path: "build" });
            }}
          />
        </div>
      </Container>
    </section>
  );
}

function JourneyCard({
  href: to,
  kicker,
  title,
  lead,
  visual,
  onSelect,
}: {
  href: string;
  kicker: string;
  title: string;
  lead: string;
  visual: "use" | "build";
  onSelect: () => void;
}) {
  return (
    <Link
      href={to}
      onClick={onSelect}
      className="group flex min-h-[12rem] flex-col justify-between rounded-[1.25rem] bg-white p-5 text-ink shadow-[0_24px_80px_rgba(4,14,49,0.22)] transition-transform duration-200 ease-out-soft md:min-h-[16.5rem] md:p-8 motion-safe:hover:-translate-y-0.5"
    >
      <div>
        <p className="label">{kicker}</p>
        <h2 className="mt-3 text-h3 text-pretty">{title}</h2>
        <p className="mt-2 max-w-[36ch] text-small text-ink-2">{lead}</p>
      </div>
      <div className="mt-8 flex items-end justify-between gap-4">
        {visual === "use" ? <UsePreview /> : <BuildPreview />}
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-signal text-on-dark transition-colors duration-150 group-hover:bg-signal-2">
          <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

function UsePreview() {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1.5" aria-hidden="true">
      <span className="h-1.5 w-[72%] rounded-full bg-paper-3" />
      <span className="h-1.5 w-[48%] rounded-full bg-paper-3" />
      <span className="h-1.5 w-[61%] rounded-full bg-marine-tint" />
    </span>
  );
}

function BuildPreview() {
  return (
    <span className="relative h-9 w-24" aria-hidden="true">
      <span className={cn("absolute inset-x-4 top-0 h-7 rounded-md border border-line bg-paper-2")} />
      <span className="absolute inset-x-2 top-1.5 h-7 rounded-md border border-line bg-paper" />
      <span className="absolute inset-x-0 top-3 h-7 rounded-md border border-line bg-white" />
    </span>
  );
}
