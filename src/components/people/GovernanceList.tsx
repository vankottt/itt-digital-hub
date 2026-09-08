import type { Locale } from "@/lib/i18n";
import { governance } from "@/content/methodology";
import { cn } from "@/lib/cn";

/** Planned governance functions as a ruled list — functions, not appointees. */
export function GovernanceList({ locale, compact = false, className }: { locale: Locale; compact?: boolean; className?: string }) {
  return (
    <ol className={cn("divide-y divide-line border-y border-line", className)}>
      {governance.map((g) => (
        <li key={g.code} className={cn("grid gap-2 md:grid-cols-12 md:gap-8", compact ? "py-4" : "py-6")}>
          <div className="md:col-span-4 flex items-baseline gap-3">
            <span className="label">{g.code}</span>
            <h3 className={cn("font-serif text-ink", compact ? "text-h4" : "text-h3")}>{g.title[locale]}</h3>
          </div>
          <div className="md:col-span-8">
            <p className={cn("text-ink-2", compact ? "text-small" : "text-body")}>{g.body[locale]}</p>
            {!compact && g.items ? (
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-small text-ink-3">
                {g.items[locale].map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-px w-3 bg-line-strong" />
                    {it}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
