"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  Database,
  FileText,
  Folder,
  Hash,
  ScrollText,
  Settings,
  Shield,
  Target,
  Users,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { AGENT_KIT_FILES } from "@/lib/ai-act/kit-manifest";
import { trackAiActEvent } from "@/lib/ai-act/analytics";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/editorial/SectionHeading";
import { Button, ButtonLink } from "@/components/ui/ButtonLink";
import { CheckIcon } from "@/components/ui/Icons";
import { ProductChrome } from "./ProductChrome";
import { CopyButton } from "./CopyButton";
import { LeadCapture } from "./LeadCapture";
import { RouteProgress } from "./JourneyProgress";
import { useAiActSession } from "./AiActSessionProvider";
import type { AgentKitFileId } from "@/lib/ai-act/types";

function scrollToStep(step: string) {
  document.querySelector(`[data-build-step='${step}']`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const FILE_ICONS: Record<AgentKitFileId, typeof FileText> = {
  readme: BookOpen,
  installer: FileText,
  system: ScrollText,
  config: Settings,
  tests: ClipboardCheck,
  version: Hash,
  sources: Folder,
};

const PART_ICONS = [FileText, Database, Target, Users, Shield] as const;
const STAGE_ICONS = [Database, FileText, Users, Shield] as const;

function StepPhoto({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="build-photo">
      <Image src={src} alt={alt} fill priority={priority} sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
    </div>
  );
}

function Continue({ locale, to }: { locale: Locale; to: string }) {
  return (
    <div className="mt-8">
      <Button type="button" arrow className="min-h-11" onClick={() => scrollToStep(to)}>
        {copy.journey.continue[locale]}
      </Button>
    </div>
  );
}

function Split({
  step,
  labelledBy,
  content,
  visual,
  tint = false,
  align = "center",
}: {
  step: string;
  labelledBy: string;
  content: ReactNode;
  visual: ReactNode;
  tint?: boolean;
  align?: "center" | "start";
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      data-build-step={step}
      className={tint ? "bg-paper-2" : "bg-paper"}
    >
      <Container className="py-12 md:py-16 lg:py-20">
        <div className={align === "start" ? "grid items-start gap-10 lg:grid-cols-12 lg:gap-12" : "grid items-center gap-10 lg:grid-cols-12 lg:gap-12"}>
          <div className="lg:col-span-5">{content}</div>
          <div className="lg:col-span-7 lg:sticky lg:top-28">{visual}</div>
        </div>
      </Container>
    </section>
  );
}

export function BuildJourney({
  locale,
  installerPrompt,
  testQuestion,
  testCriteria,
}: {
  locale: Locale;
  installerPrompt: string;
  testQuestion: string;
  testCriteria: string[];
}) {
  const { session, update } = useAiActSession();
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    update((current) => ({ ...current, journey: current.journey ?? "build", locale }));
    trackAiActEvent("ai_act_page_view", { locale, surface: "build" });
    trackAiActEvent("ai_act_path_selected", { locale, path: "build" });
  }, [locale, update]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-build-step]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const step = entry.target.getAttribute("data-build-step");
          if (!step || seen.current.has(step)) continue;
          seen.current.add(step);
          update((current) => ({ ...current, buildStep: step }));
          trackAiActEvent("ai_act_build_step_viewed", { locale, step });
        }
      },
      { threshold: 0.35 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [locale, update]);

  async function downloadKit() {
    if (downloading) return;
    setDownloading(true);
    setDownloadMessage(null);
    update((current) => ({ ...current, kitDownloadRequested: true }));
    trackAiActEvent("ai_act_kit_download_clicked", { locale });
    try {
      const response = await fetch("/api/ai-act/kit");
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("zip")) {
        setDownloadMessage(
          response.status === 403 ? copy.lead.downloadBody[locale] : copy.chat.errors.kit_not_ready[locale],
        );
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "itt-ai-act-agent-kit.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      update((current) => ({ ...current, kitDownloaded: true }));
      setDownloadMessage(copy.build.step3.downloaded[locale]);
    } catch {
      setDownloadMessage(copy.chat.errors.network[locale]);
    } finally {
      setDownloading(false);
    }
  }

  const visuals = copy.journey.visuals;

  return (
    <div className="bg-paper">
      <ProductChrome locale={locale} title={copy.build.kicker[locale]} aside={copy.provenance[locale]} />
      <RouteProgress locale={locale} />

      <Split
        step="compose"
        labelledBy="build-step-1"
        content={
          <>
            <p className="label">{copy.build.step1.label[locale]}</p>
            <h1 id="build-step-1" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step1.title[locale]}
            </h1>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step1.lead[locale]}</p>
            <ol className="mt-8 grid gap-3">
              {copy.build.step1.parts.map((part, index) => {
                const Icon = PART_ICONS[index] ?? FileText;
                return (
                  <li key={part.title.en} className="build-part">
                    <span className="build-part-num">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-h4 text-ink">{part.title[locale]}</p>
                      <p className="mt-0.5 text-small text-ink-2">{part.body[locale]}</p>
                    </div>
                    <Icon className="build-part-icon" strokeWidth={1.75} aria-hidden />
                  </li>
                );
              })}
            </ol>
            <Continue locale={locale} to="kit" />
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-1.jpg" alt={visuals.compose[locale]} priority />}
      />

      <Split
        step="kit"
        labelledBy="build-step-2"
        tint
        align="start"
        content={
          <>
            <p className="label">{copy.build.step2.label[locale]}</p>
            <h2 id="build-step-2" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step2.heading[locale]}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step2.lead[locale]}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {AGENT_KIT_FILES.map((file) => {
                const card = copy.build.step2.files[file.id as AgentKitFileId];
                const Icon = FILE_ICONS[file.id as AgentKitFileId];
                return (
                  <li key={file.id} className="build-file">
                    <Icon className="build-file-icon" strokeWidth={1.75} aria-hidden />
                    <p className="font-mono text-meta text-ink-3">{file.name}</p>
                    <p className="mt-1 text-small font-medium text-ink">{card.title[locale]}</p>
                    <p className="mt-1 text-small text-ink-2">{card.body[locale]}</p>
                  </li>
                );
              })}
            </ul>
            <Continue locale={locale} to="download" />
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-2.jpg" alt={visuals.kit[locale]} />}
      />

      <Split
        step="download"
        labelledBy="build-step-3"
        align="start"
        content={
          <>
            <p className="label">{copy.build.step3.label[locale]}</p>
            <h2 id="build-step-3" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step3.title[locale]}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step3.lead[locale]}</p>
            <div className="mt-8">
              {!session.leadCaptured ? (
                <LeadCapture locale={locale} reason="download" variant="panel" onCompleted={() => void downloadKit()} />
              ) : (
                <div className="rounded-[1.25rem] bg-white p-6 md:p-8">
                  <p className="text-small text-ink-2">{copy.build.step3.readyNote[locale]}</p>
                  <div className="mt-6">
                    <Button type="button" onClick={() => void downloadKit()} disabled={downloading} className="min-h-11">
                      {downloading ? copy.build.step3.downloading[locale] : copy.build.step3.download[locale]}
                    </Button>
                  </div>
                  {downloadMessage ? (
                    <p className="mt-4 text-small text-ink-2" role="status">
                      {downloadMessage}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
            <Continue locale={locale} to="chatgpt" />
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-3.jpg" alt={visuals.download[locale]} />}
      />

      <Split
        step="chatgpt"
        labelledBy="build-step-4"
        tint
        align="start"
        content={
          <>
            <p className="label">{copy.build.step4.label[locale]}</p>
            <h2 id="build-step-4" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step4.title[locale]}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step4.lead[locale]}</p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.build.step4.steps.map((step, index) => (
                <li key={step.en} className="build-part">
                  <span className="build-part-num">{index + 1}</span>
                  <p className="text-small font-medium text-ink">{step[locale]}</p>
                </li>
              ))}
            </ol>
            <div className="build-prompt mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="label">{copy.build.step4.promptLabel[locale]}</p>
                <CopyButton
                  value={installerPrompt}
                  label={copy.build.step4.copy[locale]}
                  copiedLabel={copy.build.step4.copied[locale]}
                  onCopied={() => trackAiActEvent("ai_act_installer_prompt_copied", { locale })}
                />
              </div>
              <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-small text-ink-2">{installerPrompt}</pre>
            </div>
            <Continue locale={locale} to="assemble" />
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-4.jpg" alt={visuals.chatgpt[locale]} />}
      />

      <Split
        step="assemble"
        labelledBy="build-step-5"
        content={
          <>
            <p className="label">{copy.build.step5.label[locale]}</p>
            <h2 id="build-step-5" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step5.title[locale]}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step5.lead[locale]}</p>
            <div className="mt-8 grid gap-3">
              {copy.build.step5.stages.map((stage, index) => {
                const Icon = STAGE_ICONS[index] ?? FileText;
                return (
                  <div key={stage.title.en} className="build-part">
                    <Icon className="build-part-icon" strokeWidth={1.75} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-h4 text-ink">{stage.title[locale]}</p>
                      <p className="mt-0.5 text-small text-ink-2">{stage.body[locale]}</p>
                    </div>
                    <span className="build-plus" aria-hidden="true">
                      +
                    </span>
                  </div>
                );
              })}
              <p className="build-agent-chip">
                <Bot className="size-5" strokeWidth={1.75} aria-hidden />
                {copy.build.step5.result[locale]}
              </p>
            </div>
            <Continue locale={locale} to="validate" />
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-5.jpg" alt={visuals.assemble[locale]} />}
      />

      <Split
        step="validate"
        labelledBy="build-step-6"
        tint
        align="start"
        content={
          <>
            <p className="label">{copy.build.step6.label[locale]}</p>
            <h2 id="build-step-6" className="mt-3 max-w-[16ch] text-h1 text-balance">
              {copy.build.step6.title[locale]}
            </h2>
            <p className="mt-4 max-w-[46ch] text-lead text-ink-2">{copy.build.step6.lead[locale]}</p>
            <div className="mt-8 grid gap-4">
              <div className="build-prompt">
                <p className="label">{copy.build.step6.questionLabel[locale]}</p>
                <p className="mt-3 text-body text-ink">{testQuestion}</p>
                <div className="mt-5">
                  <CopyButton
                    value={testQuestion}
                    label={copy.build.step6.copyTest[locale]}
                    copiedLabel={copy.build.step4.copied[locale]}
                    onCopied={() => trackAiActEvent("ai_act_test_copied", { locale })}
                  />
                </div>
              </div>
              <div className="build-prompt">
                <p className="label">{copy.build.step6.criteriaLabel[locale]}</p>
                <ul className="mt-4 grid gap-2.5">
                  {testCriteria.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-small text-ink-2">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-signal/10 text-signal">
                        <CheckIcon className="size-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        }
        visual={<StepPhoto src="/tools/ai-act-build/step-6.jpg" alt={visuals.validate[locale]} />}
      />

      <section className="bg-marine text-on-dark" data-surface="dark" data-build-step="complete" aria-labelledby="build-complete">
        <Container className="py-section-sm">
          <p className="label-dark">{copy.provenance[locale]}</p>
          <h2 id="build-complete" className="mt-4 max-w-[16ch] text-hero text-balance text-on-dark">
            {copy.build.completion.title[locale]}
          </h2>
          <p className="mt-6 max-w-[54ch] text-lead text-on-dark-muted">{copy.build.completion.lead[locale]}</p>
          <ol className="mt-10 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
            {copy.build.completion.chain.map((item, index) => (
              <li key={item.en} className="flex items-center gap-2 text-h4 text-on-dark">
                <span>{item[locale]}</span>
                {index < copy.build.completion.chain.length - 1 ? (
                  <span className="hidden text-on-dark-muted md:inline" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-[54ch] text-small text-on-dark-muted">{copy.build.completion.principle[locale]}</p>
        </Container>
      </section>

      <Section labelledBy="build-next" size="sm" rule={false}>
        <div data-build-step="next">
          <SectionHeading
            label={copy.build.next.label[locale]}
            heading={copy.build.next.title[locale]}
            id="build-next"
            align="split"
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {copy.build.next.items.map((item, index) => (
              <li key={item.title.en} className="build-file">
                <p className="label">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-h3 text-ink">{item.title[locale]}</h3>
                <p className="mt-2 text-small text-ink-2">{item.body[locale]}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 max-w-2xl">
            <p className="text-h3 text-ink">{copy.build.next.ctaLead[locale]}</p>
            <div className="mt-6">
              <ButtonLink
                href={href(locale, "work-with-us")}
                onClick={() => {
                  update((current) => ({
                    ...current,
                    ctaInteractions: [...current.ctaInteractions, "contact"],
                  }));
                  trackAiActEvent("ai_act_contact_clicked", { locale });
                }}
              >
                {copy.build.next.cta[locale]}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
