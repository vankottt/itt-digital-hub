import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { aiActAgent } from "@/content/ai-act-agent";
import { EntryExperience } from "@/components/ai-act-agent/EntryExperience";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({
    locale,
    key: "ai-act-agent",
    title: aiActAgent.meta.title[locale],
    description: aiActAgent.meta.description[locale],
  });
}

export default async function AiActAgentPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return <EntryExperience locale={locale} />;
}
