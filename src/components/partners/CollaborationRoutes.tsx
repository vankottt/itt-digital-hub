import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { collaborationRoutes } from "@/content/collaboration";
import { ArrowRight, FundingIcon, IndustryIcon, InstitutionIcon, UniversityIcon } from "@/components/ui/Icons";

/** Hairline mark for a collaboration audience — replaces the R1–R4 codes. */
export function CollaborationRouteIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  const Icon =
    slug === "public-institutions"
      ? InstitutionIcon
      : slug === "universities-researchers"
        ? UniversityIcon
        : slug === "business-industry"
          ? IndustryIcon
          : slug === "funding-innovation"
            ? FundingIcon
            : null;
  if (!Icon) return null;
  return <Icon size={size} />;
}

/** Four audiences as a compact ruled list — detail lives on /work-with-us. */
export function CollaborationRoutesPreview({ locale }: { locale: Locale }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {collaborationRoutes.map((r) => (
        <li key={r.slug}>
          <Link
            href={`${href(locale, "work-with-us")}#${r.slug}`}
            className="group grid gap-2 py-5 no-underline md:grid-cols-12 md:items-center md:gap-8"
          >
            <span className="inline-flex text-ink-3 transition-colors duration-150 group-hover:text-marine md:col-span-2">
              <CollaborationRouteIcon slug={r.slug} />
            </span>
            <h3 className="text-h4 text-ink transition-colors duration-150 group-hover:text-marine md:col-span-5">
              {r.audience[locale]}
            </h3>
            <p className="text-small text-ink-3 md:col-span-4">{r.audienceExamples[locale][0]}</p>
            <span className="hidden md:col-span-1 md:flex md:justify-end">
              <ArrowRight className="text-ink-3 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-marine" size={16} />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
