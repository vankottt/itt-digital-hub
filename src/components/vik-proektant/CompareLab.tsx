"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import type { Locale } from "@/lib/i18n";
import { comparisonExamples, vikProektant as copy, type ExampleId } from "@/content/vik-proektant";
import type { PublicCalculation, PublicSource, ToolKind } from "@/vik-proektant/comparison/presentation";
import { AnswerMarkdown } from "@/components/vik-proektant/AnswerMarkdown";

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
  const [result, setResult] = useState<Payload | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
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
    <div>
      <form onSubmit={onSubmit} className="rounded-[1.25rem] bg-white p-5 md:p-6">
        <label htmlFor="vik-prompt" className="text-small font-medium text-ink">
          {text.promptLabel[locale]}
        </label>
        <textarea
          id="vik-prompt"
          value={prompt}
          maxLength={4000}
          rows={5}
          onChange={(event) => {
            setPrompt(event.target.value);
            setExampleId(null);
          }}
          placeholder={text.promptPlaceholder[locale]}
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-body text-ink outline-none focus:border-ink"
        />
        <div className="mt-4">
          <p className="text-meta text-ink-3">{text.examples[locale]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {comparisonExamples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => {
                  setExampleId(example.id);
                  setPrompt(example.prompt[locale]);
                }}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-meta text-ink hover:border-ink"
              >
                {example.title[locale]}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={pending || prompt.trim().length < 2}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-marine px-5 py-3 text-small font-medium text-on-dark transition-colors hover:bg-marine-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? text.pending[locale] : text.submit[locale]}
        </button>
        {formError ? <p className="mt-3 text-small text-ink-2">{text.errors[formError][locale]}</p> : null}
      </form>

      {result && !result.fair ? <p className="mt-4 text-small text-ink-2">{text.unfair[locale]}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2" aria-busy={pending}>
        <ResultCard locale={locale} title={text.controlTitle[locale]} note={text.controlNote[locale]} pending={pending} pendingLabel={text.controlWaiting[locale]}>
          {!pending && result?.control.ok ? <AnswerMarkdown text={result.control.text} mode="control" /> : null}
          {!pending && result && !result.control.ok ? <p>{text.errors[result.control.error][locale]}</p> : null}
        </ResultCard>
        <ResultCard locale={locale} title={text.expertTitle[locale]} pending={pending} pendingLabel={text.expertWaiting[locale]}>
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
    <article className="min-w-0 rounded-[1.25rem] bg-white p-5 md:p-6">
      <h2 className="text-h4 text-pretty text-ink">{title}</h2>
      {note ? <p className="mt-2 text-meta text-ink-3">{note}</p> : null}
      <div className="mt-4 text-small text-ink-2">
        {pending ? pendingLabel : null}
        {!pending && !hasContent(children) ? text.idle[locale] : null}
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

function SourceBlock({ locale, sources }: { locale: Locale; sources: PublicSource[] }) {
  const text = copy.compare;
  const heading = sources.length >= 3 ? `${text.sourcesTitle[locale]} (${sources.length})` : text.sourcesTitle[locale];
  const body = <SourceList sources={sources} />;
  if (sources.length < 3) {
    return (
      <section className="mt-6 border-t border-line pt-4">
        <h3 className="flex items-center gap-2 text-small font-medium text-ink">
          <DocumentIcon />
          {heading}
        </h3>
        {body}
      </section>
    );
  }
  return (
    <details open className="mt-6 border-t border-line pt-4">
      <summary className="flex cursor-pointer items-center gap-2 text-small font-medium text-ink">
        <DocumentIcon />
        {heading}
      </summary>
      {body}
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
    <section className="mt-6 border-t border-line pt-4">
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
