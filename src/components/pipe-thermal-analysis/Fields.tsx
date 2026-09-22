import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const controlShell =
  "flex h-9 min-w-0 items-center rounded-md border bg-paper px-2.5 transition-colors duration-150 focus-within:border-signal";
const controlWidth = "w-full sm:w-[10.75rem] sm:shrink-0";

export function NumericField({
  id,
  label,
  value,
  unit,
  hint,
  error,
  onChange,
  inputMode = "decimal",
}: {
  id: string;
  label: string;
  value: string;
  unit: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
  inputMode?: "decimal" | "numeric";
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor={id} className="min-w-0 flex-1 text-meta text-ink-2">
          {label}
        </label>
        <div
          className={cn(
            controlShell,
            controlWidth,
            error ? "border-signal" : "border-line",
          )}
        >
          <input
            id={id}
            value={value}
            inputMode={inputMode}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            onChange={(event) => onChange(event.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent text-right font-sans text-small text-ink tabular-nums outline-none"
          />
          <span className="ml-1.5 shrink-0 font-sans text-meta text-ink-3" aria-hidden="true">
            {unit}
          </span>
        </div>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1 text-meta text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-meta text-signal-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  hint,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor={id} className="min-w-0 flex-1 text-meta text-ink-2">
          {label}
        </label>
        <div className={cn(controlShell, controlWidth, "relative border-line")}>
          <select
            id={id}
            value={value}
            aria-describedby={hintId}
            onChange={(event) => onChange(event.target.value)}
            className="h-full w-full min-w-0 appearance-none bg-transparent pr-5 font-sans text-small text-ink outline-none"
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-2 text-ink-3" aria-hidden="true">
            <Chevron />
          </span>
        </div>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1 text-meta text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex items-center gap-2 text-small font-medium text-ink">
        <span className="h-3 w-0.5 shrink-0 bg-signal" aria-hidden="true" />
        {title}
      </legend>
      <div className="mt-3 grid gap-2.5">{children}</div>
    </fieldset>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.25 6 7.75 9.5 4.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
