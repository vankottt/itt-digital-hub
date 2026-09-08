import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { workPage as c } from "@/content/pages";
import { people, linkedInHref } from "@/content/people";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/editorial/SectionHeading";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({ locale, key: "work-with-us", title: c.meta.title[locale], description: c.meta.description[locale] });
}

export default async function WorkWithUsPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const founders = people.filter((person) => person.slug === "ivan-todorov" || person.slug === "ivan-tomchev");

  return (
    <>
      <PageHeader label={c.meta.title[locale]} heading={c.heading[locale]} lead={c.lead[locale]} />

      <Section id="contact" labelledBy="contact-heading" size="sm">
        <SectionHeading label={c.contact.label[locale]} heading={c.contact.heading[locale]} id="contact-heading" lead={c.pathBody[locale]} align="split" />
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {founders.map((person) => {
            const linkedIn = linkedInHref(person);
            return (
              <li key={person.slug} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <p className="text-small text-ink">{person.name[locale]}</p>
                  {person.role ? <p className="text-meta text-ink-3">{person.role[locale]}</p> : null}
                </div>
                {linkedIn ? (
                  <a href={linkedIn} className="link-quiet text-small" rel="noopener noreferrer" target="_blank">
                    LinkedIn
                  </a>
                ) : (
                  <p className="text-meta text-ink-3">LinkedIn: TODO_CONTENT</p>
                )}
              </li>
            );
          })}
          <li className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <p className="text-small text-ink">Email</p>
            <p className="text-meta text-ink-3">TODO_CONTENT</p>
          </li>
          <li className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <p className="text-small text-ink">{locale === "bg" ? "График" : "Scheduling"}</p>
            <p className="text-meta text-ink-3">TODO_CONTENT</p>
          </li>
        </ul>
      </Section>

      <Section tone="tint" labelledBy="principle-heading" size="sm">
        <SectionHeading label={c.independence.label[locale]} heading={c.independence.heading[locale]} id="principle-heading" lead={c.independenceBody[locale]} align="split" />
      </Section>
    </>
  );
}
