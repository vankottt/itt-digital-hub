"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { AGENT_KIT_FILES } from "@/lib/ai-act/kit-manifest";
import { trackAiActEvent } from "@/lib/ai-act/analytics";
import { InView } from "@/components/systems/InView";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/editorial/SectionHeading";
import { Button, ButtonLink } from "@/components/ui/ButtonLink";
import { CheckIcon } from "@/components/ui/Icons";
import { ProductChrome } from "./ProductChrome";
import { CopyButton } from "./CopyButton";
import { LeadCapture } from "./LeadCapture";
import { useAiActSession } from "./AiActSessionProvider";
import type { AgentKitFileId } from "@/lib/ai-act/types";

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

  return (
    <div className="bg-paper pt-24 md:pt-28">
      <ProductChrome locale={locale} title={copy.build.kicker[locale]} aside={copy.provenance[locale]} />

      <Section labelledBy="build-step-1" size="sm" rule={false}>
        <div data-build-step="compose">
          <SectionHeading
            label={copy.build.step1.label[locale]}
            heading={copy.build.step1.title[locale]}
            id="build-step-1"
            lead={copy.build.step1.lead[locale]}
            align="split"
          />
          <InView className="mt-12">
            <ol className="grid gap-3">
              {copy.build.step1.parts.map((part, index) => (
                <li
                  key={part.title.en}
                  className="surface-card draw-fade"
                  style={{ "--draw-delay": `${0.08 * index}s` } as CSSProperties}
                >
                  <p className="label">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-h3 text-ink">{part.title[locale]}</h3>
                  <p className="mt-1 text-small text-ink-2">{part.body[locale]}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center text-meta text-ink-3" aria-hidden="true">
              ↓
            </p>
            <p className="surface-card mt-2 bg-marine text-center text-h3 text-on-dark">{copy.build.step1.result[locale]}</p>
          </InView>
        </div>
      </Section>

      <Section tone="tint" labelledBy="build-step-2" size="sm" rule={false}>
        <div data-build-step="kit">
          <SectionHeading
            label={copy.build.step2.label[locale]}
            heading={copy.build.step2.heading[locale]}
            id="build-step-2"
            lead={copy.build.step2.lead[locale]}
            align="split"
          />
          <ul className="mt-12 grid gap-3 md:grid-cols-2">
            {AGENT_KIT_FILES.map((file) => {
              const card = copy.build.step2.files[file.id as AgentKitFileId];
              return (
                <li key={file.id}>
                  <details className="ai-act-file surface-card h-full">
                    <summary className="flex items-start justify-between gap-3">
                      <span>
                        <span className="font-mono text-meta text-ink-3">{file.name}</span>
                        <span className="mt-2 block text-h4 text-ink">{card.title[locale]}</span>
                      </span>
                      <span className="label shrink-0">{file.kind === "folder" ? (locale === "bg" ? "папка" : "folder") : locale === "bg" ? "файл" : "file"}</span>
                    </summary>
                    <p className="mt-4 text-small text-ink-2">{card.body[locale]}</p>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <Section labelledBy="build-step-3" size="sm" rule={false}>
        <div data-build-step="download">
          <SectionHeading
            label={copy.build.step3.label[locale]}
            heading={copy.build.step3.title[locale]}
            id="build-step-3"
            lead={copy.build.step3.lead[locale]}
            align="split"
          />
          <div className="mt-10 max-w-2xl">
            {!session.leadCaptured ? (
              <LeadCapture locale={locale} reason="download" onCompleted={() => void downloadKit()} />
            ) : (
              <div className="surface-card">
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
        </div>
      </Section>

      <Section tone="tint" labelledBy="build-step-4" size="sm" rule={false}>
        <div data-build-step="chatgpt">
          <SectionHeading
            label={copy.build.step4.label[locale]}
            heading={copy.build.step4.title[locale]}
            id="build-step-4"
            lead={copy.build.step4.lead[locale]}
            align="split"
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {copy.build.step4.steps.map((step, index) => (
              <li key={step.en} className="surface-card">
                <p className="label">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-3 text-h4 text-ink">{step[locale]}</p>
              </li>
            ))}
          </ol>
          <div className="surface-card mt-6">
            <p className="label">{copy.build.step4.promptLabel[locale]}</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-sans text-small text-ink-2">{installerPrompt}</pre>
            <div className="mt-6">
              <CopyButton
                value={installerPrompt}
                label={copy.build.step4.copy[locale]}
                copiedLabel={copy.build.step4.copied[locale]}
                onCopied={() => trackAiActEvent("ai_act_installer_prompt_copied", { locale })}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="build-step-5" size="sm" rule={false}>
        <div data-build-step="assemble">
          <SectionHeading
            label={copy.build.step5.label[locale]}
            heading={copy.build.step5.title[locale]}
            id="build-step-5"
            lead={copy.build.step5.lead[locale]}
            align="split"
          />
          <InView className="mt-12">
            <ol className="grid gap-3">
              {copy.build.step5.stages.map((stage, index) => (
                <li
                  key={stage.en}
                  className="flex items-center gap-4 border-b border-line py-4 draw-fade"
                  style={{ "--draw-delay": `${0.12 * index}s` } as CSSProperties}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-marine text-on-dark">
                    {index < copy.build.step5.stages.length - 1 ? <CheckIcon /> : <span className="text-meta">…</span>}
                  </span>
                  <span className="text-h3 text-ink">{stage[locale]}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center text-meta text-ink-3" aria-hidden="true">
              ↓
            </p>
            <p className="mt-2 text-center text-h2 text-ink">{copy.build.step5.result[locale]}</p>
          </InView>
        </div>
      </Section>

      <Section tone="tint" labelledBy="build-step-6" size="sm" rule={false}>
        <div data-build-step="validate">
          <SectionHeading
            label={copy.build.step6.label[locale]}
            heading={copy.build.step6.title[locale]}
            id="build-step-6"
            lead={copy.build.step6.lead[locale]}
            align="split"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="surface-card lg:col-span-7">
              <p className="label">{copy.build.step6.questionLabel[locale]}</p>
              <p className="mt-4 text-body text-ink">{testQuestion}</p>
              <div className="mt-6">
                <CopyButton
                  value={testQuestion}
                  label={copy.build.step6.copyTest[locale]}
                  copiedLabel={copy.build.step4.copied[locale]}
                  onCopied={() => trackAiActEvent("ai_act_test_copied", { locale })}
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="label">{copy.build.step6.criteriaLabel[locale]}</p>
              <ul className="mt-4 grid gap-2">
                {testCriteria.map((item) => (
                  <li key={item} className="flex gap-3 text-small text-ink-2">
                    <CheckIcon className="mt-1 shrink-0 text-signal" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

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
              <li key={item.title.en} className="surface-card">
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
