"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { comparisonExamples, vikProektant as copy, type ExampleId } from "@/content/vik-proektant";
import type { PublicCalculation, PublicSource, ToolKind } from "@/vik-proektant/comparison/presentation";
import { AnswerMarkdown } from "@/components/vik-proektant/AnswerMarkdown";
import { Button } from "@/components/ui/ButtonLink";

type ErrorCode = "timeout" | "upstream" | "configuration" | "model_mismatch" | "empty" | "rate_limited" | "invalid_prompt";

type ControlResult = { ok: true; text: string } | { ok: false; error: ErrorCode };

type ExpertResult =
  | {
      ok: true;
      text: string;
      retrievalUsed?: boolean;
      calculationPerformed?: boolean;
      calculationInputRejected?: boolean;
      sources?: PublicSource[];
      calculations?: PublicCalculation[];
      toolKinds?: ToolKind[];
    }
  | { ok: false; error: ErrorCode };

type Payload = {
  retryAfterMs?: number;
  fair: boolean;
  control: ControlResult;
  expert: ExpertResult;
  summary: {
    sourceCount: number;
    retrievalUsed: boolean;
    calculationPerformed: boolean;
    calculationInputRejected: boolean;
  };
  error?: ErrorCode;
};

export function CompareLab({ locale }: { locale: Locale }) {
  const text = copy.compare;
  const [prompt, setPrompt] = useState(comparisonExamples[0]?.prompt[locale] ?? "");
  const [exampleId, setExampleId] = useState<ExampleId | null>(comparisonExamples[0]?.id ?? null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<ErrorCode | null>(null);
  const [retryAfterMs, setRetryAfterMs] = useState<number | null>(null);
  const [result, setResult] = useState<Payload | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = fieldRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`;
  }, [prompt]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setRetryAfterMs(null);
    setResult(null);
    const selected = exampleId && comparisonExamples.some((item) => item.id === exampleId && item.prompt[locale] === prompt) ? exampleId : null;
    track(selected ? "selected_example_prompt" : "custom_prompt_used", selected ? { example: selected } : {});
    track("comparison_started", { example: selected ?? "custom" });
    try {
      const response = await fetch("/api/vik-proektant/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, locale, exampleId: selected }),
      });
      const body = (await response.json()) as Payload;
      if (!response.ok) {
        setFormError(body.error ?? "upstream");
        setRetryAfterMs(typeof body.retryAfterMs === "number" ? body.retryAfterMs : null);
        track(response.status === 429 ? "comparison_completed" : "comparison_completed", { status: "rejected" });
        return;
      }
      setResult(body);
      if (!body.control.ok) track("control_error", { error: body.control.error });
      if (!body.expert.ok) track("expert_error", { error: body.expert.error });
      if (body.expert.ok && body.summary.retrievalUsed) track("expert_used_retrieval", { sources: body.summary.sourceCount });
      if (body.expert.ok && body.summary.calculationPerformed) track("expert_used_calculation", {});
      track("comparison_completed", { fair: body.fair });
    } catch {
      setFormError("upstream");
      track("comparison_completed", { status: "failed" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_16px_40px_rgba(4,14,49,0.06)] md:px-6 md:py-5">
      <form onSubmit={onSubmit}>
        <label htmlFor="vik-prompt" className="text-small font-medium text-ink">
          {text.promptLabel[locale]}
        </label>
        <textarea
          ref={fieldRef}
          id="vik-prompt"
          value={prompt}
          maxLength={4000}
          rows={2}
          onChange={(event) => {
            setPrompt(event.target.value);
            setExampleId(null);
          }}
          placeholder={text.promptPlaceholder[locale]}
          className="mt-2 w-full resize-none overflow-hidden rounded-2xl border border-line bg-paper px-4 py-2.5 text-body text-ink outline-none focus-visible:border-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        />
        <div className="mt-3">
          <p className="text-meta text-ink-3">{text.examples[locale]}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {comparisonExamples.map((example) => {
              const selected = exampleId === example.id;
              return (
                <button
                  key={example.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setExampleId(example.id);
                    setPrompt(example.prompt[locale]);
                  }}
                  className={cn(
                    "min-h-11 rounded-xl border px-3 py-2 text-left text-small text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                    selected ? "border-ink bg-paper" : "border-line bg-white hover:border-ink",
                  )}
                >
                  {example.title[locale]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button type="submit" variant="primary" arrow disabled={pending || prompt.trim().length < 2}>
            {pending ? text.pending[locale] : text.submit[locale]}
          </Button>
          {pending ? <IttCompareMark /> : null}
        </div>
        {formError ? (
          <p role="status" className="mt-3 max-w-[62ch] rounded-xl border border-line bg-paper px-4 py-3 text-small text-ink">
            {formMessage(locale, formError, retryAfterMs)}
          </p>
        ) : null}
      </form>

      {result && !result.fair ? <p className="mt-4 text-small text-ink-2">{text.unfair[locale]}</p> : null}

      <p className="mt-5 border-t border-line pt-4 text-meta text-ink-3">{text.fairness[locale]}</p>
      <div className="mt-3 grid min-h-[22rem] items-start gap-3 lg:min-h-[24rem] lg:grid-cols-2" aria-busy={pending}>
        <ResultCard locale={locale} title={text.controlTitle[locale]} note={text.controlNote[locale]} pending={pending} pendingLabel={text.controlWaiting[locale]}>
          {!pending && result?.control.ok ? <AnswerMarkdown text={result.control.text} mode="control" /> : null}
          {!pending && result && !result.control.ok ? <p>{text.errors[result.control.error][locale]}</p> : null}
        </ResultCard>
        <ResultCard locale={locale} title={text.expertTitle[locale]} note={text.expertNote[locale]} pending={pending} pendingLabel={text.expertWaiting[locale]}>
          {!pending && result?.expert.ok ? <ExpertAnswer locale={locale} result={result.expert} /> : null}
          {!pending && result && !result.expert.ok ? <p>{text.errors[result.expert.error][locale]}</p> : null}
        </ResultCard>
      </div>
      <p className="mt-4 max-w-[65ch] text-meta text-ink-3">{text.disclosure[locale]}</p>
    </div>
  );
}

function ResultCard({
  locale,
  title,
  note,
  pending,
  pendingLabel,
  children,
}: {
  locale: Locale;
  title: string;
  note?: string;
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  const text = copy.compare;
  return (
    <article className="min-w-0 rounded-[1.25rem] border border-line bg-paper p-4 md:p-5">
      <h2 className="text-h4 text-pretty text-ink">{title}</h2>
      {note ? <p className="mt-1.5 text-meta text-ink-3">{note}</p> : null}
      <div className="mt-3 min-h-28 text-small text-ink-2">
        {pending ? (
          <div>
            <p>{pendingLabel}</p>
            <SkeletonLines />
          </div>
        ) : null}
        {!pending && !hasContent(children) ? (
          <div>
            <p className="sr-only">{text.idle[locale]}</p>
            <SkeletonLines />
          </div>
        ) : null}
        {!pending ? children : null}
      </div>
    </article>
  );
}

function ExpertAnswer({ locale, result }: { locale: Locale; result: Extract<ExpertResult, { ok: true }> }) {
  const text = copy.compare;
  const sources = result.sources ?? [];
  const calculations = (result.calculations ?? []).filter((item) => !item.rejected && item.results.length > 0);
  const rejected = (result.calculations ?? []).find((item) => item.rejected);
  const meta = expertMeta(locale, result, sources.length);
  return (
    <div>
      {meta ? <p className="text-meta text-ink-3">{meta}</p> : null}
      <div className="mt-4">
        <AnswerMarkdown text={result.text} mode="expert" />
      </div>
      {calculations.map((calculation, index) => (
        <CalculationBlock key={index} locale={locale} calculation={calculation} />
      ))}
      {rejected ? (
        <p className="mt-4 flex items-start gap-2 text-small text-ink-2">
          <InfoIcon />
          <span>{rejected.message || text.calculationRejected[locale]}</span>
        </p>
      ) : null}
      {sources.length > 0 ? <SourceBlock locale={locale} sources={sources} /> : null}
      {(result.toolKinds ?? []).length > 0 ? <ToolDetails locale={locale} kinds={result.toolKinds ?? []} /> : null}
    </div>
  );
}

function expertMeta(locale: Locale, result: Extract<ExpertResult, { ok: true }>, sourceCount: number): string {
  const text = copy.compare;
  const parts: string[] = [];
  if (sourceCount > 0) parts.push(sourceCount === 1 ? text.sourceOne[locale] : `${sourceCount} ${text.sourceMany[locale]}`);
  if (result.retrievalUsed) parts.push(text.retrieval[locale]);
  if (result.calculationPerformed) parts.push(text.calculation[locale]);
  return parts.join(" · ");
}

function formMessage(locale: Locale, error: ErrorCode, retryAfterMs: number | null): string {
  const text = copy.compare;
  if (error !== "rate_limited" || !retryAfterMs) return text.errors[error][locale];
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  if (locale === "bg") {
    return seconds < 60
      ? `${text.errors.rate_limited.bg} Опитайте отново след ${seconds} сек.`
      : `${text.errors.rate_limited.bg} Опитайте отново след ${Math.ceil(seconds / 60)} мин.`;
  }
  return seconds < 60
    ? `${text.errors.rate_limited.en} Try again in ${seconds} sec.`
    : `${text.errors.rate_limited.en} Try again in ${Math.ceil(seconds / 60)} min.`;
}

function SourceBlock({ locale, sources }: { locale: Locale; sources: PublicSource[] }) {
  const text = copy.compare;
  return (
    <details className="mt-5 border-t border-line pt-4">
      <summary className="flex cursor-pointer items-center gap-2 text-small font-medium text-ink">
        <DocumentIcon />
        {text.sourcesTitle[locale]} ({sources.length})
      </summary>
      <SourceList sources={sources} />
    </details>
  );
}

function SourceList({ sources }: { sources: PublicSource[] }) {
  return (
    <ol className="mt-3 space-y-3">
      {sources.map((source, index) => (
        <li key={`${source.title}-${index}`} className="text-small">
          <p className="text-ink">
            <span className="text-ink-3">[{index + 1}] </span>
            {source.url ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2">
                {sourceLabel(source)}
              </a>
            ) : (
              sourceLabel(source)
            )}
          </p>
          {source.locators.map((locator) => (
            <p key={locator} className="text-meta text-ink-3">
              {locator}
            </p>
          ))}
          {source.dvReference && !source.title.includes(source.dvReference) && !source.locators.some((locator) => locator.includes(source.dvReference)) ? (
            <p className="text-meta text-ink-3">{source.dvReference}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function sourceLabel(source: PublicSource): string {
  if (source.number && !source.title.includes(source.number)) return `${source.title} · ${source.number}`;
  return source.title;
}

function CalculationBlock({ locale, calculation }: { locale: Locale; calculation: PublicCalculation }) {
  const text = copy.compare;
  const primary = calculation.results[0];
  const rest = calculation.results.slice(1);
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h3 className="flex items-center gap-2 text-small font-medium text-ink">
        <CalculatorIcon />
        {text.result[locale]}
      </h3>
      {calculation.inputs.length > 0 ? (
        <div className="mt-3">
          <p className="text-meta text-ink-3">{text.inputs[locale]}</p>
          <dl className="mt-2 space-y-1">
            {calculation.inputs.map((row) => (
              <div key={row.key} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-small">
                <dt className="text-ink-2">{text.fields[row.key][locale]}</dt>
                <dd className="text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {primary ? (
        <div className="mt-4 rounded-2xl bg-paper px-4 py-3">
          <p className="flex items-center gap-2 text-meta text-ink-3">
            <CheckIcon />
            {text.calculated[locale]}
          </p>
          <p className="mt-1 text-body text-ink">
            {text.fields[primary.key][locale]}: {primary.value}
            {primary.unit ? ` ${primary.unit}` : ""}
          </p>
          {rest.length > 0 ? (
            <dl className="mt-2 space-y-1">
              {rest.map((row) => (
                <div key={row.key} className="flex flex-wrap justify-between gap-x-4 text-small">
                  <dt className="text-ink-2">{text.fields[row.key][locale]}</dt>
                  <dd className="text-ink">
                    {row.value}
                    {row.unit ? ` ${row.unit}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ToolDetails({ locale, kinds }: { locale: Locale; kinds: ToolKind[] }) {
  const text = copy.compare;
  const labels: Record<ToolKind, string> = {
    retrieval: text.toolRetrieval[locale],
    reference: text.toolReference[locale],
    calculation: text.toolCalculation[locale],
  };
  return (
    <details className="mt-5">
      <summary className="cursor-pointer text-meta text-ink-3">{text.tools[locale]}</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-meta text-ink-3">
        {kinds.map((kind) => (
          <li key={kind}>{labels[kind]}</li>
        ))}
      </ul>
    </details>
  );
}

function IttCompareMark() {
  return (
    <svg viewBox="0 0 128 52" className="itt-compare-mark h-10 w-auto" aria-hidden="true">
      <g fill="#040e31">
        <rect x="2" y="10" width="11" height="26" />
        <rect x="21" y="10" width="28" height="7" />
        <rect x="30" y="10" width="10" height="26" />
        <rect x="57" y="10" width="28" height="7" />
        <rect x="66" y="10" width="10" height="26" />
      </g>
      <rect className="itt-line" x="2" y="42" width="83" height="5" fill="#002cff" />
      <rect className="itt-square" x="94" y="6" width="14" height="14" rx="1" fill="#002cff" />
    </svg>
  );
}

function SkeletonLines() {
  return (
    <div aria-hidden="true" className="mt-3 space-y-2">
      <div className="h-2.5 w-11/12 rounded-full bg-line" />
      <div className="h-2.5 w-full rounded-full bg-line/80" />
      <div className="h-2.5 w-2/3 rounded-full bg-line/70" />
    </div>
  );
}

function hasContent(children: ReactNode): boolean {
  if (children == null || children === false) return false;
  if (Array.isArray(children)) return children.some((child) => hasContent(child));
  return true;
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-ink-3">
      <path d="M4 2.5h5.5L12.5 5.5V13.5H4v-11Z" stroke="currentColor" strokeWidth="1.25" />
      <path d="M9.5 2.5V5.5H12.5M6 8.5h4M6 11h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-ink-3">
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 5h5M5.5 8h1M8 8h1M10.5 8h1M5.5 10.5h1M8 10.5h1M10.5 10.5h1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path d="m3.5 8.5 3 3 6-6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.2V11M8 5.2h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
