import type { Locale } from "./i18n";

/** Route keys used across navigation, sitemap and language switching. */
export type RouteKey =
  | "home"
  | "about"
  | "methodology"
  | "projects"
  | "insights"
  | "news"
  | "people"
  | "work-with-us"
  | "privacy"
  | "ai-act-agent";

const segments: Record<RouteKey, string> = {
  home: "",
  about: "about",
  methodology: "methodology",
  projects: "projects",
  insights: "insights",
  news: "news",
  people: "people",
  "work-with-us": "work-with-us",
  privacy: "privacy",
  "ai-act-agent": "ai-act-agent",
};

export function href(locale: Locale, key: RouteKey, slug?: string): string {
  const seg = segments[key];
  const base = seg ? `/${locale}/${seg}` : `/${locale}`;
  return slug ? `${base}/${slug}` : base;
}

/** Swap the locale prefix of a localized pathname. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  // ["", "bg", ...rest]
  if (parts.length >= 2 && (parts[1] === "bg" || parts[1] === "en")) {
    parts[1] = to;
    return parts.join("/") || `/${to}`;
  }
  return `/${to}${pathname === "/" ? "" : pathname}`;
}

/** Entry and nested journeys for the AI Act product. */
export function isAiActAgentPath(pathname: string): boolean {
  return /^\/(bg|en)\/ai-act-agent(?:\/.*)?$/.test(pathname);
}

/** Dark first-viewport overlay, same header treatment as the homepage. */
export function isAiActAgentEntryPath(pathname: string): boolean {
  return /^\/(bg|en)\/ai-act-agent\/?$/.test(pathname);
}
