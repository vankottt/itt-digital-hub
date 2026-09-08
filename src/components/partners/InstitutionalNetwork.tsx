import type { Locale } from "@/lib/i18n";
import { site } from "@/content/site";

/**
 * Retained for unused admin/about leftovers. Public ITT pages use Experience across instead.
 */
export function InstitutionalNetwork({
  locale,
}: {
  locale: Locale;
  variant?: "panel" | "status";
}) {
  return (
    <p className="text-small text-ink-3">
      {site.name[locale]} · {site.descriptor[locale]}
    </p>
  );
}
