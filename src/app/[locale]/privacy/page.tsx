import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { privacyPage as c } from "@/content/pages";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Container } from "@/components/layout/Container";
import { Paragraphs } from "@/components/editorial/Blocks";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return { ...pageMetadata({ locale, key: "privacy", title: c.meta.title[locale], description: c.meta.description[locale] }), robots: { index: false, follow: true } };
}

export default async function PrivacyPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return (
    <>
      <PageHeader heading={c.heading[locale]} />
      <Container className="pb-section">
        <div className="max-w-[68ch] border-t border-line pt-8">
          <Paragraphs items={c.body[locale]} />
        </div>
      </Container>
    </>
  );
}
