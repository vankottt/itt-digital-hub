import type { Metadata } from "next";
import { locales, localeLabels, type Locale } from "./i18n";
import { href, type RouteKey } from "./paths";
import { siteUrl } from "./site-url";
import { site } from "@/content/site";
import { allowPublicIndexing, robotsDirective } from "@/lib/indexing";

export function pageMetadata({
  locale,
  key,
  slug,
  title,
  description,
  type = "website",
}: {
  locale: Locale;
  key: RouteKey;
  slug?: string;
  title: string;
  description: string;
  type?: "website" | "article";
}): Metadata {
  const base = siteUrl();
  const path = href(locale, key, slug);
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[localeLabels[loc].htmlLang] = `${base}${href(loc, key, slug)}`;
  }
  languages["x-default"] = `${base}${href("bg", key, slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${base}${path}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${base}${path}`,
      siteName: site.name[locale],
      locale: localeLabels[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeLabels[l].ogLocale),
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: robotsDirective(allowPublicIndexing()),
  };
}
