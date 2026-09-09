import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/content/types";
import { localizedApproachName } from "@/content/approach";
import { t } from "@/content/messages";
import { projectsPage as c } from "@/content/pages";
import { StatusLabel } from "./ProjectMeta";

function Cell({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid gap-2 border-t border-line py-5 md:grid-cols-12 md:gap-8">
      <dt className="label md:col-span-4">{label}</dt>
      <dd className="text-body text-ink-2 md:col-span-8">{children}</dd>
    </div>
  );
}

export function ProjectExecutive({ project, locale }: { project: Project; locale: Locale }) {
  const m = t(locale);
  const d = c.detail;
  const outputs = project.outputs?.items.slice(0, 8).map((o) => o.title[locale]) ?? [];
  const actors = project.stakeholders?.groups[locale].slice(0, 8) ?? [];
  const expected = project.expectedOutcomes?.[locale] ?? project.successCriteria?.[locale] ?? [];

  return (
    <section aria-labelledby="executive-heading" className="border border-line">
      <div className="bg-paper-2 px-5 py-4 md:px-8">
        <p className="label">{d.executive[locale]}</p>
        <h2 id="executive-heading" className="mt-2 font-serif text-h3 text-ink">
          {d.glance[locale]}
        </h2>
      </div>
      <dl className="px-5 md:px-8">
        <Cell label={m.status}>
          <StatusLabel status={project.status} locale={locale} />
        </Cell>
        <Cell label={d.proposition[locale]}>{project.standfirst[locale]}</Cell>
        <Cell label={d.problem[locale]}>{project.systemProblem[locale][0]}</Cell>
        <Cell label={d.objective[locale]}>{project.objective[locale][0]}</Cell>
        {project.scope ? <Cell label={d.scope[locale]}>{project.scope.intro[locale]}</Cell> : null}
        <Cell label={d.method[locale]}>{localizedApproachName(project.methodologyName, locale)}</Cell>
        {actors.length ? (
          <Cell label={d.actors[locale]}>
            <ul className="grid gap-1 sm:grid-cols-2">
              {actors.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Cell>
        ) : null}
        {outputs.length ? (
          <Cell label={d.intended[locale]}>
            <ul className="grid gap-1 sm:grid-cols-2">
              {outputs.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </Cell>
        ) : null}
        {expected.length ? (
          <Cell label={d.expected[locale]}>
            <ul className="space-y-1">
              {expected.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Cell>
        ) : null}
        <Cell label={d.validation[locale]}>{project.validation ? project.validation.loop[locale].join(" → ") : null}</Cell>
        <Cell label={d.measured[locale]}>
          {project.measuredResults && project.measuredResults[locale].length > 0
            ? project.measuredResults[locale].join("; ")
            : d.measuredEmpty[locale]}
        </Cell>
      </dl>
      <p className="border-t border-line px-5 py-4 text-meta text-ink-3 md:px-8">{project.statusNote[locale]}</p>
    </section>
  );
}
