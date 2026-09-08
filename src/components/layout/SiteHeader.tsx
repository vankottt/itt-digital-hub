"use client";

import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { primaryNav } from "@/content/site";
import { t } from "@/content/messages";
import { isHomePath } from "@/lib/home-nav";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher, useLocaleSwitchScrollToTop } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./DesktopNav";
import { useHomeSectionSpy } from "./useHomeSectionSpy";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = t(locale);
  const pathname = usePathname() ?? "";
  const onHome = isHomePath(pathname);
  const spyKey = useHomeSectionSpy(onHome);
  useLocaleSwitchScrollToTop(locale);
  const links = primaryNav.map((item) => ({
    href: href(locale, item.key),
    label: item.label[locale],
    emphasis: item.key === "work-with-us",
    navKey: item.key,
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper [--header-h:4.75rem] md:[--header-h:5.25rem]">
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo locale={locale} layout="compact" className="min-w-0 shrink xl:flex-none" />
        <DesktopNav locale={locale} links={links} label={m.primaryNav} pathname={pathname} onHome={onHome} spyKey={spyKey} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher current={locale} label={m.language} className="hidden xl:flex" />
          <MobileMenu
            locale={locale}
            links={links}
            pathname={pathname}
            onHome={onHome}
            spyKey={spyKey}
            labels={{ open: m.openMenu, close: m.closeMenu, menu: m.menu, language: m.language, languageNav: m.languageMenu }}
          />
        </div>
      </Container>
    </header>
  );
}
