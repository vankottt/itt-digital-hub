import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { aiActAgent } from "@/content/ai-act-agent";
import { getInstallerPrompt, getPrimaryTestCase } from "@/lib/ai-act/kit";
import { BuildJourney } from "@/components/ai-act-agent/BuildJourney";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return pageMetadata({
    locale,
    key: "ai-act-agent",
    slug: "build",
    title: aiActAgent.buildMeta.title[locale],
    description: aiActAgent.buildMeta.description[locale],
  });
}

export default async function AiActBuildPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const test = getPrimaryTestCase(locale);
  return (
    <BuildJourney
      locale={locale}
      installerPrompt={getInstallerPrompt(locale)}
      testQuestion={test.question}
      testCriteria={test.criteria}
    />
  );
}
