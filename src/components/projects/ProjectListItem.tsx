import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import type { Project } from "@/content/types";
import { t } from "@/content/messages";
import { ArrowRight } from "@/components/ui/Icons";
import { StatusLabel } from "./ProjectMeta";

/** Soft card row for the projects index — agency experiment. */
export function ProjectListItem({ project, locale }: { project: Project; locale: Locale }) {
  const m = t(locale);
  return (
    <li>
      <Link
        href={href(locale, "projects", project.slug)}
        className="group surface-card grid gap-4 transition-shadow duration-200 hover:shadow-[0_16px_48px_rgba(4,14,49,0.08)] md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <StatusLabel status={project.status} locale={locale} />
          <dl className="mt-3 space-y-1 text-meta text-ink-3">
            <div>
              <dt className="sr-only">{m.type}</dt>
              <dd>{project.type[locale]}</dd>
            </div>
            <div>
              <dt className="sr-only">{m.domain}</dt>
              <dd>{project.domain[locale]}</dd>
            </div>
          </dl>
        </div>
        <div className="md:col-span-8">
          <h2 className="text-h3 text-ink transition-colors duration-150 group-hover:text-signal">{project.title[locale]}</h2>
          <p className="mt-3 max-w-2xl text-body text-ink-2">{project.summary[locale]}</p>
        </div>
        <div className="hidden md:col-span-1 md:flex md:justify-end md:pt-2">
          <ArrowRight className="text-ink-3 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-signal" size={18} />
        </div>
      </Link>
    </li>
  );
}
