import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { fontClassName } from "../fonts";
import { isLocale, locales, localeLabels, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { site } from "@/content/site";
import { t } from "@/content/messages";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OrganizationJsonLd } from "@/components/layout/OrganizationJsonLd";
import { allowPublicIndexing, robotsDirective } from "@/lib/indexing";
import { Analytics } from "@vercel/analytics/next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: site.name[locale],
      template: `%s – ${site.short[locale]}`,
    },
    description: site.description[locale],
    applicationName: site.name[locale],
    robots: robotsDirective(allowPublicIndexing()),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = t(locale);

  return (
    <html lang={localeLabels[locale].htmlLang} className={fontClassName}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-marine focus:px-4 focus:py-2 focus:text-on-dark"
        >
          {m.skipToContent}
        </a>
        <SiteHeader locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <OrganizationJsonLd locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
