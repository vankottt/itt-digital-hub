"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { explorerFieldLabels, explorerStages, type ExplorerStage } from "@/content/methodology-explorer";
import { cn } from "@/lib/cn";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <p className="label mb-2">{label}</p>
      {children}
    </div>
  );
}

function StageDetail({ stage, locale }: { stage: ExplorerStage; locale: Locale }) {
  const f = explorerFieldLabels;
  return (
    <div className="space-y-5">
      <div>
        <p className="label">{stage.code}</p>
        <h3 className="mt-2 font-serif text-h3 text-ink">{stage.title[locale]}</h3>
      </div>
      <Field label={f.purpose[locale]}>
        <p className="text-body text-ink-2">{stage.purpose[locale]}</p>
      </Field>
      {stage.questions ? (
        <Field label={f.questions[locale]}>
          <ul className="space-y-2 text-small text-ink-2">
            {stage.questions[locale].map((q) => (
              <li key={q} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                {q}
              </li>
            ))}
          </ul>
        </Field>
      ) : null}
      {stage.analysed ? (
        <Field label={f.analysed[locale]}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stage.analysed[locale].map((item) => (
              <li key={item} className="flex gap-3 text-small text-ink-2">
                <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-amber" />
                {item}
              </li>
            ))}
          </ul>
        </Field>
      ) : null}
      {stage.output ? (
        <Field label={f.output[locale]}>
          <p className="text-small text-ink-2">{stage.output[locale]}</p>
        </Field>
      ) : null}
      {stage.next ? (
        <Field label={f.next[locale]}>
          <p className="text-small text-ink-2">{stage.next[locale]}</p>
        </Field>
      ) : null}
    </div>
  );
}

export function MethodologyExplorer({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { stage: string; loopNote: string; explorer: string };
}) {
  const [active, setActive] = useState(0);
  const panelId = useId();
  const tabId = useId();
  const current = explorerStages[active] ?? explorerStages[0]!;

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % explorerStages.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + explorerStages.length) % explorerStages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = explorerStages.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    const el = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next];
    el?.focus();
  };

  return (
    <div>
      <div className="hidden lg:block">
        <div role="tablist" aria-label={labels.explorer} className="grid grid-cols-5 gap-px border border-line bg-line">
          {explorerStages.map((s, i) => (
            <button
              key={s.code}
              id={`${tabId}-${s.code}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={panelId}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => onTabKey(event, i)}
              className={cn(
                "flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-2 px-2 py-3 text-center transition-colors duration-150",
                i === active ? "bg-marine text-on-dark" : "bg-paper text-ink hover:bg-paper-2",
              )}
            >
              <span className={cn("font-mono text-[0.6875rem] tracking-[0.06em]", i === active ? "text-amber" : "text-ink-3")}>{s.code}</span>
              <span className="text-[0.75rem] leading-tight font-medium">{s.short[locale]}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">01 → 10 · {labels.loopNote}</p>
        <div id={panelId} role="tabpanel" aria-labelledby={`${tabId}-${current.code}`} className="mt-8 grid gap-10 border border-line lg:grid-cols-12">
          <p className="sr-only">
            {labels.stage} {current.code}
          </p>
          <nav className="border-b border-line p-4 lg:col-span-4 lg:border-r lg:border-b-0 lg:p-6" aria-label={labels.explorer}>
            <ol className="space-y-1">
              {explorerStages.map((s, i) => (
                <li key={s.code}>
                  <button
                    type="button"
                    aria-current={i === active ? "step" : undefined}
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex w-full items-baseline gap-3 px-2 py-2 text-left text-small transition-colors duration-150",
                      i === active ? "bg-marine-tint text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    <span className="label w-6 shrink-0">{s.code}</span>
                    <span className="font-medium">{s.title[locale]}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="p-6 lg:col-span-8 lg:p-8">
            <StageDetail stage={current} locale={locale} />
          </div>
        </div>
      </div>

      <ol className="divide-y divide-line border-y border-line lg:hidden">
        {explorerStages.map((s) => (
          <li key={s.code} id={`explorer-${s.code}`} className="py-8">
            <StageDetail stage={s} locale={locale} />
          </li>
        ))}
        <li className="py-4 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-3">↺ {labels.loopNote}</li>
      </ol>
    </div>
  );
}
