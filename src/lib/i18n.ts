export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** A field carrying both language versions. Shared IDs/slugs, localized text. */
export type L<T = string> = Record<Locale, T>;

export function otherLocale(locale: Locale): Locale {
  return locale === "bg" ? "en" : "bg";
}

export const localeLabels: Record<Locale, { short: string; long: string; htmlLang: string; ogLocale: string }> = {
  bg: { short: "BG", long: "Български", htmlLang: "bg", ogLocale: "bg_BG" },
  en: { short: "EN", long: "English", htmlLang: "en", ogLocale: "en_GB" },
};
