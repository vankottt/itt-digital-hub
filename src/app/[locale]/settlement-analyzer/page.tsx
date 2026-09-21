import type { Metadata } from "next";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { href } from "@/lib/paths";
import { isAdminSession } from "@/settlement-analyzer/server/admin-auth";
import { CONTACT_COOKIE } from "@/settlement-analyzer/server/session";
import { AnalyzerEntry } from "@/settlement-analyzer/AnalyzerEntry";
import { settlementAnalyzer } from "@/settlement-analyzer/copy";

type LocaleParams = { params: Promise<{ locale: string }> };
type PageParams = LocaleParams & {
  searchParams: Promise<{ test_registration?: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return {
    ...pageMetadata({
      locale,
      key: "settlement-analyzer",
      title: `${settlementAnalyzer.name[locale]} · ITT Digital Hub`,
      description: settlementAnalyzer.metaDescription[locale],
    }),
    title: { absolute: `${settlementAnalyzer.name[locale]} · ITT Digital Hub` },
    alternates: {
      canonical: href(locale, "settlement-analyzer"),
      languages: { bg: href("bg", "settlement-analyzer"), en: href("en", "settlement-analyzer") },
    },
  };
}

export default async function SettlementAnalyzerPage({ params, searchParams }: PageParams) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const query = await searchParams;
  const ownerMode = await isAdminSession();
  const cookieStore = await cookies();
  const initial = {
    registered: ownerMode || Boolean(cookieStore.get(CONTACT_COOKIE)?.value),
    ownerMode,
    profileCompleted: false,
    analysisCount: 0,
  };
  return (
    <AnalyzerEntry
      locale={locale}
      ownerMode={ownerMode}
      initial={initial}
      testRegistration={ownerMode && query.test_registration === "1"}
    />
  );
}
