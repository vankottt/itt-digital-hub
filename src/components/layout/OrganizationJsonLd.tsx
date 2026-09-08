import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

/**
 * Organization structured data with confirmed fields only.
 * No parent university, address, telephone, email, or founding date.
 */
export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name[locale],
    alternateName: [site.short[locale], site.name[locale === "bg" ? "en" : "bg"]],
    description: site.description[locale],
    url: `${siteUrl()}/${locale}`,
    image: `${siteUrl()}/brand/itt-lockup.png`,
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json">{json}</script>;
}
