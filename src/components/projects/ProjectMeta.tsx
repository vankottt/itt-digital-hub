import type { Locale } from "@/lib/i18n";
import type { Project } from "@/content/types";
import { t } from "@/content/messages";
import { cn } from "@/lib/cn";

export function StatusLabel({ status, locale, tone = "ink" }: { status: Project["status"]; locale: Locale; tone?: "ink" | "on-dark" }) {
  const m = t(locale);
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-label uppercase", tone === "ink" ? "text-ink-2" : "text-on-dark-muted")}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber" />
      {m.statuses[status]}
    </span>
  );
}

/** Reusable status / type / domain / methodology metadata as a definition list. */
export function ProjectMeta({ project, locale, className, layout = "row" }: { project: Project; locale: Locale; className?: string; layout?: "row" | "stack" }) {
  const m = t(locale);
  const items: Array<[string, string]> = [
    [m.status, m.statuses[project.status]],
    [m.type, project.type[locale]],
    [m.domain, project.domain[locale]],
    [m.methodology, project.methodologyName],
  ];
  return (
    <dl
      className={cn(
        layout === "row" ? "grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4" : "grid gap-4",
        "border-y border-line py-4",
        className,
      )}
    >
      {items.map(([k, v], i) => (
        <div key={k}>
          <dt className="label">{k}</dt>
          <dd className={cn("mt-1 text-small text-ink", i === 0 && "flex items-center gap-2")}>
            {i === 0 ? <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" /> : null}
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
