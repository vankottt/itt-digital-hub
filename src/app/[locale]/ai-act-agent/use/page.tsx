import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { aiActAgent } from "@/content/ai-act-agent";
import { HostedAssistant } from "@/components/ai-act-agent/HostedAssistant";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({
    locale,
    key: "ai-act-agent",
    slug: "use",
    title: aiActAgent.useMeta.title[locale],
    description: aiActAgent.useMeta.description[locale],
  });
}

export default async function AiActUsePage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return <HostedAssistant locale={locale} />;
}
