import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { href } from "@/lib/paths";
import { vikProektant } from "@/content/vik-proektant";
import { Container } from "@/components/layout/Container";
import { BackLink } from "@/components/ui/BackLink";
import { CompareLab } from "@/components/vik-proektant/CompareLab";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return {
    ...pageMetadata({
      locale,
      key: "vik-proektant",
      slug: "compare",
      title: vikProektant.compareMeta.title[locale],
      description: vikProektant.compareMeta.description[locale],
    }),
    title: { absolute: `${vikProektant.compareMeta.title[locale]} · ITT Digital Hub` },
    alternates: {
      canonical: href(locale, "vik-proektant", "compare"),
      languages: {
        bg: href("bg", "vik-proektant", "compare"),
        en: href("en", "vik-proektant", "compare"),
      },
    },
  };
}

export default async function VikComparePage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const text = vikProektant.compare;
  return (
    <div className="bg-paper">
      <Container className="pt-4 pb-12 md:pt-5 md:pb-16">
        <BackLink href={href(locale, "vik-proektant")}>{text.back[locale]}</BackLink>
        <header className="mt-4 max-w-[42rem]">
          <h1 className="text-h1 text-pretty">{text.heading[locale]}</h1>
          <p className="mt-3 text-body text-ink-2">{text.lead[locale]}</p>
        </header>
        <div className="mt-6">
          <CompareLab locale={locale} />
        </div>
      </Container>
    </div>
  );
}
