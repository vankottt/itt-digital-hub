import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import type { Project } from "@/content/types";
import { t } from "@/content/messages";
import { SectionHeading } from "@/components/editorial/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Chain } from "@/components/systems/Chain";
import { ProjectMeta } from "./ProjectMeta";

/** Featured applied pilot: scannable evidence of the methodology, not a case study. */
export function ProjectFeature({ project, locale, label, chainTitle }: { project: Project; locale: Locale; label: string; chainTitle: string }) {
  const m = t(locale);
  const url = href(locale, "projects", project.slug);
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
      <div className="lg:col-span-6">
        <SectionHeading label={`${label} · ${m.statuses[project.status]}`} heading={project.title[locale]} id="featured-heading" />
        <p className="mt-5 max-w-2xl text-lead text-ink-2">{project.standfirst[locale]}</p>
        <ProjectMeta project={project} locale={locale} className="mt-8 max-w-2xl" />
        <p className="mt-4 max-w-2xl text-meta text-ink-3">{project.statusNote[locale]}</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href={url}>{m.toProject}</ArrowLink>
          <ArrowLink href={href(locale, "methodology")}>{m.toMethodology}</ArrowLink>
        </div>
      </div>
      <div className="lg:col-span-6">
        {project.scope?.chain ? (
          <div className="drafting-grid border border-line p-5 md:p-6">
            <Chain items={project.scope.chain[locale]} frameLabel={chainTitle} numbered className="border-0 bg-paper/80 p-4 sm:p-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
