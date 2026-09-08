import Link from "next/link";
import "./globals.css";
import { fontClassName } from "./fonts";
import { t } from "@/content/messages";
import { site } from "@/content/site";
import { Mark } from "@/components/layout/Logo";

/**
 * Root 404 for paths outside a valid locale (the proxy normally redirects
 * these, so this is a safety net). Bilingual by design: both languages
 * are shown because the locale is unknown here.
 */
export default function RootNotFound() {
  const bg = t("bg");
  const en = t("en");
  return (
    <html lang="bg" className={fontClassName}>
      <body className="min-h-svh bg-paper text-ink">
        <title>{`${bg.notFoundTitle} · ${en.notFoundTitle} – ${site.short.bg}`}</title>
        <main id="main" className="container-site flex min-h-svh flex-col justify-center py-16">
          <Mark size={58} />
          <p className="label mt-10">404</p>
          <h1 className="mt-4 text-h1">{bg.notFoundTitle}</h1>
          <p className="mt-3 text-lead text-ink-2">{bg.notFoundBody}</p>
          <div className="rule mt-8 pt-6" lang="en">
            <h2 className="text-h3">{en.notFoundTitle}</h2>
            <p className="mt-2 text-body text-ink-2">{en.notFoundBody}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 font-sans text-small font-medium">
            <Link href="/bg" className="link-quiet">
              {bg.backHome} — {site.name.bg}
            </Link>
            <Link href="/en" lang="en" className="link-quiet">
              {en.backHome} — {site.name.en}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
