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
  const copyright = `© ${year} ${site.name[locale]}`;

  return (
    <footer className="bg-marine text-on-dark" data-surface="dark">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo locale={locale} tone="on-dark" layout="full" />
            <p className="mt-6 max-w-sm text-small text-on-dark-muted">{site.descriptor[locale]}</p>
            <p className="mt-8 hidden font-sans text-[0.75rem] text-on-dark-muted md:block">{copyright}</p>
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
            <p className="mt-8 max-w-sm text-small text-on-dark-muted">
              {site.contactNote[locale]}{" "}
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="text-on-dark-muted transition-colors duration-150 hover:text-on-dark hover:underline hover:decoration-amber hover:underline-offset-[4px]"
              >
                {site.phone}
              </a>
            </p>
          </div>

          <p className="font-sans text-[0.75rem] text-on-dark-muted md:hidden">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
