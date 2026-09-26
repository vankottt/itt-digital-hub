import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { href } from "@/lib/paths";
import { vikProektant } from "@/content/vik-proektant";
import { VikProductView } from "@/components/vik-proektant/VikProductView";
import { chatGptDestination } from "@/vik-proektant/publication";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return {
    ...pageMetadata({
      locale,
      key: "vik-proektant",
      title: `${vikProektant.meta.title[locale]} · ITT Digital Hub`,
      description: vikProektant.meta.description[locale],
    }),
    title: { absolute: `${vikProektant.meta.title[locale]} · ITT Digital Hub` },
    alternates: {
      canonical: href(locale, "vik-proektant"),
      languages: { bg: href("bg", "vik-proektant"), en: href("en", "vik-proektant") },
    },
  };
}

export default async function VikProektantPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const destination = chatGptDestination();
  return <VikProductView locale={locale} chatGptUrl={destination.state === "published" ? destination.url : null} />;
}
