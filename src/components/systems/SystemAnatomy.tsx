import type { Locale } from "@/lib/i18n";
import { failureModes, systemComponents } from "@/content/methodology";
import { cn } from "@/lib/cn";

/**
 * Two ruled columns: what a system is built from (C1–C8) and where it
 * fails (F01–F11). Pure HTML — reflows to one column on small screens.
 */
export function SystemAnatomy({
  locale,
  heading,
  componentsCol,
  failuresCol,
  className,
}: {
  locale: Locale;
  heading: string;
  componentsCol: string;
  failuresCol: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line", className)}>
      <h3 className="sr-only">{heading}</h3>
      <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
        <div className="md:pr-8">
          <p className="label py-3">{componentsCol}</p>
          <ol className="divide-y divide-line border-y border-line">
            {systemComponents.map((c) => (
              <li key={c.code} className="grid grid-cols-[3rem_1fr] gap-3 py-3">
                <span className="label pt-1">{c.code}</span>
                <span>
                  <span className="block text-body font-medium text-ink">{c.title[locale]}</span>
                  <span className="mt-0.5 block text-small text-ink-3">{c.hint[locale]}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 md:mt-0 md:pl-8">
          <p className="label py-3">{failuresCol}</p>
          <ol className="divide-y divide-line border-y border-line">
            {failureModes.map((f) => (
              <li key={f.code} className="grid grid-cols-[3rem_1fr] gap-3 py-3">
                <span className="label pt-1 text-amber-ink">{f.code}</span>
                <span className="text-body text-ink">{f.title[locale]}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
