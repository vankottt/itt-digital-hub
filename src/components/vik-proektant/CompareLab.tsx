"use client";

import { useState, type FormEvent } from "react";
import { track } from "@vercel/analytics";
import type { Locale } from "@/lib/i18n";
import { comparisonExamples, vikProektant as copy, type ExampleId } from "@/content/vik-proektant";

type ErrorCode = "timeout" | "upstream" | "configuration" | "model_mismatch" | "empty" | "rate_limited" | "invalid_prompt";

type SideResult =
  | { ok: true; text: string; sourceCount?: number; retrievalUsed?: boolean; calculationPerformed?: boolean; calculationInputRejected?: boolean }
  | { ok: false; error: ErrorCode };

type Payload = {
  fair: boolean;
  control: SideResult;
  expert: SideResult;
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
        <ResultCard locale={locale} title={text.controlTitle[locale]} note={text.controlNote[locale]} pending={pending} result={result?.control ?? null} />
        <ResultCard
          locale={locale}
          title={text.expertTitle[locale]}
          note={result?.expert.ok ? expertNote(locale, result.summary) : undefined}
          pending={pending}
          result={result?.expert ?? null}
          facts={result?.summary}
        />
      </div>
    </div>
  );
}

function expertNote(
  locale: Locale,
  summary: { sourceCount: number; retrievalUsed: boolean; calculationPerformed: boolean; calculationInputRejected: boolean },
): string {
  const text = copy.compare;
  const parts: string[] = [];
  if (summary.retrievalUsed) parts.push(`${text.sources[locale]}: ${summary.sourceCount}`);
  if (summary.calculationPerformed) parts.push(text.calculation[locale]);
  if (summary.calculationInputRejected) parts.push(text.calculationRejected[locale]);
  return parts.join(" · ");
}

function ResultCard({
  locale,
  title,
  note,
  pending,
  result,
  facts,
}: {
  locale: Locale;
  title: string;
  note?: string;
  pending: boolean;
  result: SideResult | null;
  facts?: { sourceCount: number; retrievalUsed: boolean; calculationPerformed: boolean; calculationInputRejected: boolean };
}) {
  const text = copy.compare;
  return (
    <article className="min-w-0 rounded-[1.25rem] bg-white p-5 md:p-6">
      <h2 className="text-h4 text-ink">{title}</h2>
      {note ? <p className="mt-2 text-meta text-ink-3">{note}</p> : null}
      {facts ? <FactList locale={locale} facts={facts} /> : null}
      <div className="mt-4 whitespace-pre-wrap break-words text-small text-ink-2">
        {pending ? text.waiting[locale] : null}
        {!pending && !result ? text.idle[locale] : null}
        {!pending && result?.ok ? result.text : null}
        {!pending && result && !result.ok ? text.errors[result.error][locale] : null}
      </div>
    </article>
  );
}

function FactList({
  locale,
  facts,
}: {
  locale: Locale;
  facts: { sourceCount: number; retrievalUsed: boolean; calculationPerformed: boolean; calculationInputRejected: boolean };
}) {
  const text = copy.compare;
  const items: string[] = [];
  if (facts.retrievalUsed) items.push(`${text.retrieval[locale]} · ${text.sources[locale]}: ${facts.sourceCount}`);
  if (facts.calculationPerformed) items.push(text.calculation[locale]);
  if (facts.calculationInputRejected) items.push(text.calculationRejected[locale]);
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1 text-meta text-ink-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
