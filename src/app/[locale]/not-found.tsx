import Link from "next/link";
import { t } from "@/content/messages";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";

/**
 * Localized 404 inside the locale shell (header/footer come from the layout).
 * not-found boundaries receive no params, so both languages are rendered
 * with correct `lang` attributes; the layout already sets the page language.
 */
export default function LocaleNotFound() {
  const bg = t("bg");
  const en = t("en");
  return (
    <Container className="py-section">
      <title>{`${bg.notFoundTitle} · ${en.notFoundTitle} · ${site.short.bg}`}</title>
      <div className="rule pt-10">
        <p className="label">404</p>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div lang="bg">
            <h1 className="text-h2">{bg.notFoundTitle}</h1>
            <p className="mt-3 text-lead text-ink-2">{bg.notFoundBody}</p>
            <Link href="/bg" className="link-quiet mt-6 inline-block font-sans text-small font-medium">
              {bg.backHome}
            </Link>
          </div>
          <div lang="en">
            <h2 className="text-h2">{en.notFoundTitle}</h2>
            <p className="mt-3 text-lead text-ink-2">{en.notFoundBody}</p>
            <Link href="/en" className="link-quiet mt-6 inline-block font-sans text-small font-medium">
              {en.backHome}
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
