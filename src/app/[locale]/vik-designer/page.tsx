import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { vikDesigner } from "@/content/vik-designer";
import { VikDesignerAssistant } from "@/components/vik-designer/VikDesignerAssistant";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({
    locale,
    key: "vik-designer",
    title: vikDesigner.meta.title[locale],
    description: vikDesigner.meta.description[locale],
  });
}

export default async function VikDesignerPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return <VikDesignerAssistant locale={locale} />;
}
