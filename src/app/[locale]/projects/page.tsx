import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { projectsPage as c } from "@/content/pages";
import { listPublishedProjects } from "@/lib/cms/repository";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProjectListItem } from "@/components/projects/ProjectListItem";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({ locale, key: "projects", title: c.meta.title[locale], description: c.meta.description[locale] });
}

export default async function ProjectsPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const projects = await listPublishedProjects();

  return (
    <>
      <PageHeader label={c.meta.title[locale]} heading={c.heading[locale]} lead={c.lead[locale]} />
      <Container className="pb-section-sm">
        <ol>
          {projects.map((p) => (
            <ProjectListItem key={p.slug} project={p} locale={locale} />
          ))}
        </ol>
      </Container>

      <Section tone="tint" size="sm" labelledBy="status-vocab-heading">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="status-vocab-heading" className="text-h3 text-ink">
              {c.statusVocabTitle[locale]}
            </h2>
            <p className="mt-3 text-small text-ink-3">{c.statusVocabNote[locale]}</p>
          </div>
          <dl className="divide-y divide-line border-y border-line lg:col-span-8">
            {c.statusVocab[locale].map(([term, def]) => (
              <div key={term} className="grid gap-1 py-3 sm:grid-cols-12 sm:gap-6">
                <dt className="font-mono text-label uppercase text-ink-2 sm:col-span-4 sm:pt-1">{term}</dt>
                <dd className="text-small text-ink-2 sm:col-span-8">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}
