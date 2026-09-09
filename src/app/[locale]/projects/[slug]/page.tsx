import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { localizedApproachName } from "@/content/approach";
import { projectsPage as c } from "@/content/pages";
import { t } from "@/content/messages";
import { projects } from "@/content/projects";
import { getProjectForPublic, listPublishedArticles, listPublishedProjects } from "@/lib/cms/repository";
import { insightRouteKey } from "@/lib/insight-channel";
import { Container } from "@/components/layout/Container";
import { Paragraphs, RuledList } from "@/components/editorial/Blocks";
import { ProjectMeta, StatusLabel } from "@/components/projects/ProjectMeta";
import { ProjectSection } from "@/components/projects/ProjectSection";
import { ProjectExecutive } from "@/components/projects/ProjectExecutive";
import { ProjectToc } from "@/components/projects/ProjectToc";
import { Chain } from "@/components/systems/Chain";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { projectScreens, storyCovers } from "@/content/stories";
import { EditorialFigure } from "@/components/editorial/EditorialFigure";
import { ProjectHeroShot, ProjectScreenGallery } from "@/components/projects/ProjectScreens";

type Params = { params: Promise<{ locale: string; slug: string }> };

/** Preview cookies and CMS reads must run per request. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const project = await getProjectForPublic(slug);
  if (!project) return {};
  return pageMetadata({ locale, key: "projects", slug, title: project.title[locale], description: project.standfirst[locale], type: "article" });
}

export default async function ProjectDetailPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const project = await getProjectForPublic(slug);
  if (!project) notFound();
  const m = t(locale);
  const d = c.detail;
  const [publishedProjects, publishedArticles] = await Promise.all([listPublishedProjects(), listPublishedArticles()]);
  const related = (project.related ?? []).map((relatedSlug) => publishedProjects.find((p) => p.slug === relatedSlug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedInsights = (project.relatedInsights ?? []).map((relatedSlug) => publishedArticles.find((i) => i.slug === relatedSlug)).filter((i): i is NonNullable<typeof i> => Boolean(i));
  const screens = projectScreens[project.slug];
  const cover = storyCovers[project.slug];
  const toc = [
    { id: "executive", label: d.glance[locale] },
    { id: "problem", label: d.problem[locale] },
    { id: "objective", label: d.objective[locale] },
    ...(project.scope ? [{ id: "scope", label: d.scope[locale] }] : []),
    { id: "methodology", label: d.methodology[locale] },
    ...(project.dataEvidence ? [{ id: "data", label: d.data[locale] }] : []),
    ...(project.stakeholders ? [{ id: "stakeholders", label: d.stakeholders[locale] }] : []),
    ...(project.targetArchitecture ? [{ id: "architecture", label: d.architecture[locale] }] : []),
    ...(project.outputs ? [{ id: "outputs", label: d.outputs[locale] }] : []),
    { id: "results", label: d.measured[locale] },
    ...(project.validation ? [{ id: "validation", label: d.validation[locale] }] : []),
    { id: "status", label: d.statusNote[locale] },
  ];

  return (
    <article>
      <header className="bg-paper">
        <Container className="pt-12 pb-10 md:pt-16 md:pb-12">
          <nav aria-label={m.breadcrumb} className="label">
            <Link href={href(locale, "projects")} className="hover:text-ink">
              {c.meta.title[locale]}
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-ink-2">{project.type[locale]}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <StatusLabel status={project.status} locale={locale} />
              <h1 className="mt-4 text-h1 text-pretty text-ink">{project.title[locale]}</h1>
              <p className="mt-6 max-w-[62ch] text-lead text-ink-2">{project.standfirst[locale]}</p>
            </div>
            <aside className="lg:col-span-4 lg:pt-12" aria-label={d.meta[locale]}>
              <ProjectMeta project={project} locale={locale} layout="stack" />
              <p className="mt-4 text-meta text-ink-3">{project.statusNote[locale]}</p>
            </aside>
          </div>
          {screens ? (
            <div className="mt-12 lg:mt-14">
              <ProjectHeroShot screens={screens} locale={locale} />
            </div>
          ) : cover?.kind === "photo" ? (
            <EditorialFigure
              src={cover.src}
              alt={cover.alt[locale]}
              ratio="aspect-[16/9]"
              className="mt-12 overflow-hidden rounded-[1.25rem] border-0 lg:mt-14"
              imageClassName="object-cover"
              sizes="(min-width: 1024px) 1100px, 100vw"
              priority
            />
          ) : null}
        </Container>
      </header>

      <Container className="pb-section">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <ProjectToc heading={d.contents[locale]} items={toc} />
          </div>
          <div className="lg:col-span-9">
            <div id="executive" className="scroll-mt-28">
              <ProjectExecutive project={project} locale={locale} />
            </div>
            <h2 className="mt-16 font-serif text-h2 text-ink">{d.detailed[locale]}</h2>

        <ProjectSection id="problem" heading={d.problem[locale]}>
          <Paragraphs items={project.systemProblem[locale]} />
          {project.symptoms ? (
            <>
              <p className="label mt-8 mb-2">{d.symptoms[locale]}</p>
              <RuledList items={project.symptoms[locale]} columns={2} />
            </>
          ) : null}
        </ProjectSection>

        {project.question ? (
          <ProjectSection id="question" heading={d.question[locale]}>
            <p className="max-w-3xl font-serif text-h3 text-ink">{project.question[locale]}</p>
          </ProjectSection>
        ) : null}

        <ProjectSection id="objective" heading={d.objective[locale]}>
          <Paragraphs items={project.objective[locale]} />
          {project.objectiveItems ? <RuledList items={project.objectiveItems[locale]} className="mt-6" /> : null}
        </ProjectSection>

        {project.scope ? (
          <ProjectSection id="scope" heading={d.scope[locale]}>
            <p className="text-body text-ink-2">{project.scope.intro[locale]}</p>
            {project.scope.chain ? <Chain items={project.scope.chain[locale]} numbered className="mt-6" /> : null}
            <RuledList items={project.scope.items[locale]} className="mt-6" columns={2} />
            {project.scope.note ? <p className="mt-5 text-small text-ink-3">{project.scope.note[locale]}</p> : null}
          </ProjectSection>
        ) : null}

        <ProjectSection id="methodology" heading={`${d.methodology[locale]} · ${localizedApproachName(project.methodologyName, locale)}`}>
          <p className="text-body text-ink-2">{project.methodology.intro[locale]}</p>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {project.methodology.stages.map((st) => (
              <li key={st.code} className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-4 flex items-baseline gap-3">
                  <span className="label">{st.code}</span>
                  <h3 className="text-h4 font-serif text-ink">{st.title[locale]}</h3>
                </div>
                <p className="text-small text-ink-2 sm:col-span-8">{st.body[locale]}</p>
              </li>
            ))}
          </ol>
        </ProjectSection>

        {project.dataEvidence ? (
          <ProjectSection id="data" heading={d.data[locale]}>
            <Paragraphs items={project.dataEvidence[locale]} />
            {screens ? (
              <div className="mt-8">
                <ProjectScreenGallery screens={screens} locale={locale} />
              </div>
            ) : null}
          </ProjectSection>
        ) : null}

        {project.stakeholders ? (
          <ProjectSection id="stakeholders" heading={d.stakeholders[locale]}>
            <p className="text-body text-ink-2">{project.stakeholders.intro[locale]}</p>
            <RuledList items={project.stakeholders.groups[locale]} className="mt-6" columns={2} />
          </ProjectSection>
        ) : null}

        {project.targetArchitecture ? (
          <ProjectSection id="architecture" heading={d.architecture[locale]}>
            <p className="text-body text-ink-2">{project.targetArchitecture.intro[locale]}</p>
            {project.targetArchitecture.relation ? <Chain items={project.targetArchitecture.relation[locale]} className="mt-6" /> : null}
            <p className="label mt-8 mb-2">{d.architectureComponents[locale]}</p>
            <RuledList items={project.targetArchitecture.components[locale]} columns={2} />
          </ProjectSection>
        ) : null}

        {project.outputs ? (
          <ProjectSection id="outputs" heading={d.outputs[locale]}>
            <p className="text-body text-ink-2">{project.outputs.intro[locale]}</p>
            <ol className="mt-6 grid border-t border-line sm:grid-cols-2">
              {project.outputs.items.map((o, i) => (
                <li key={o.title[locale]} className="border-b border-line py-4 sm:pr-8">
                  <p className="label">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-h4 font-serif text-ink">{o.title[locale]}</h3>
                  <p className="mt-1.5 text-small text-ink-2">{o.body[locale]}</p>
                </li>
              ))}
            </ol>
          </ProjectSection>
        ) : null}

        {/* Expected vs measured — always distinguished */}
        <ProjectSection id="results" heading={d.measured[locale]}>
          {project.measuredResults && project.measuredResults[locale].length > 0 ? (
            <RuledList items={project.measuredResults[locale]} />
          ) : (
            <p className="border-l-2 border-amber pl-4 text-body text-ink-2">{d.measuredEmpty[locale]}</p>
          )}
        </ProjectSection>

        {project.validation ? (
          <ProjectSection id="validation" heading={d.validation[locale]}>
            <p className="text-body text-ink-2">{project.validation.intro[locale]}</p>
            <Chain items={project.validation.loop[locale]} numbered className="mt-6" loopLabel={m.adaptNote} />
            {project.validation.indicators ? (
              <>
                <p className="label mt-8 mb-2">{d.indicators[locale]}</p>
                <RuledList items={project.validation.indicators[locale]} columns={2} />
              </>
            ) : null}
          </ProjectSection>
        ) : null}

        {project.successCriteria ? (
          <ProjectSection id="success" heading={d.success[locale]}>
            <p className="text-body text-ink-2">{d.successIntro[locale]}</p>
            <RuledList items={project.successCriteria[locale]} className="mt-4" />
          </ProjectSection>
        ) : null}

        {project.variants ? (
          <ProjectSection id="variants" heading={d.variants[locale]}>
            <ol className="grid gap-6 sm:grid-cols-2">
              {project.variants.map((v) => (
                <li key={v.title[locale]} className="border border-line p-5">
                  <h3 className="text-h4 font-serif text-ink">{v.title[locale]}</h3>
                  <p className="mt-2 text-small text-ink-2">{v.body[locale]}</p>
                  <p className="label mt-4">{v.duration[locale]}</p>
                </li>
              ))}
            </ol>
          </ProjectSection>
        ) : null}

        {project.followUp ? (
          <ProjectSection id="follow-up" heading={d.followUp[locale]}>
            <Paragraphs items={project.followUp[locale]} />
          </ProjectSection>
        ) : null}

        {project.proposedTo ? (
          <ProjectSection id="proposed-to" heading={d.proposedTo[locale]}>
            <p className="text-body text-ink-2">{project.proposedTo[locale]}</p>
          </ProjectSection>
        ) : null}

        <ProjectSection id="status" heading={d.statusNote[locale]}>
          <p className="text-body text-ink-2">{project.statusNote[locale]}</p>
          <p className="mt-4 text-meta text-ink-3">
            {d.source[locale]}: {project.sourceNote[locale]}
          </p>
        </ProjectSection>

        {related.length || relatedInsights.length ? (
          <section aria-labelledby="related-heading" className="grid gap-8 border-t border-line py-10 md:grid-cols-2">
            <h2 id="related-heading" className="sr-only">
              {m.relatedProjects} / {m.relatedInsights}
            </h2>
            {related.length ? (
              <div>
                <p className="label mb-3">{m.relatedProjects}</p>
                <ul className="space-y-3">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <ArrowLink href={href(locale, "projects", p.slug)}>{p.title[locale]}</ArrowLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {relatedInsights.length ? (
              <div>
                <p className="label mb-3">{m.relatedInsights}</p>
                <ul className="space-y-3">
                  {relatedInsights.map((i) => (
                    <li key={i.slug}>
                      <ArrowLink href={href(locale, insightRouteKey(i.type), i.slug)}>{i.title[locale]}</ArrowLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
          </div>
        </div>
      </Container>
    </article>
  );
}
