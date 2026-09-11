import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { workPage as c } from "@/content/pages";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/editorial/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactLead } from "@/components/contact/ContactEmailLink";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({ locale, key: "work-with-us", title: c.meta.title[locale], description: c.meta.description[locale] });
}

export default async function WorkWithUsPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";

  return (
    <>
      <PageHeader label={c.meta.title[locale]} heading={c.heading[locale]} lead={<ContactLead after={c.lead[locale]} />} />

      <Section id="contact" labelledBy="contact-heading" size="sm">
        <SectionHeading label={c.contact.label[locale]} heading={c.contact.heading[locale]} id="contact-heading" lead={c.pathBody[locale]} align="split" />
        <ContactForm locale={locale} />
      </Section>

      <Section tone="tint" labelledBy="principle-heading" size="sm">
        <SectionHeading label={c.independence.label[locale]} heading={c.independence.heading[locale]} id="principle-heading" lead={c.independenceBody[locale]} align="split" />
      </Section>
    </>
  );
}
