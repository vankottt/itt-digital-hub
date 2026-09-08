import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { footerNav, site } from "@/content/site";
import { t } from "@/content/messages";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = t(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-marine text-on-dark">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo locale={locale} tone="on-dark" layout="full" />
            <p className="mt-6 max-w-sm text-small text-on-dark-muted">{site.descriptor[locale]}</p>
          </div>

          <nav aria-label={m.footerNav} className="md:col-span-3">
            <ul className="grid gap-2.5 text-small">
              {footerNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={href(locale, item.key)}
                    className="text-on-dark-muted transition-colors duration-150 hover:text-on-dark hover:underline hover:decoration-amber hover:underline-offset-[4px]"
                  >
                    {item.label[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="label-dark">{m.language}</p>
            <LanguageSwitcher current={locale} tone="on-dark" label={m.languageFooter} className="mt-2" />
            <p className="mt-8 max-w-sm text-small text-on-dark-muted">{site.contactNote[locale]}</p>
          </div>
        </div>

        <div className="rule-dark mt-12 flex flex-col gap-3 pt-6 font-mono text-[0.75rem] uppercase tracking-[0.06em] text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name[locale]}
          </p>
          <p>{site.short[locale]}</p>
        </div>
      </Container>
    </footer>
  );
}
