"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { primaryNav } from "@/content/site";
import { t } from "@/content/messages";
import { isHomePath, homeHashHref } from "@/lib/home-nav";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher, useLocaleSwitchScrollToTop } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./DesktopNav";
import { scrollToHomeHash, useHomeSectionSpy } from "./useHomeSectionSpy";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = t(locale);
  const pathname = usePathname() ?? "";
  const onHome = isHomePath(pathname);
  const spyKey = useHomeSectionSpy(onHome);
  useLocaleSwitchScrollToTop(locale);
  const [darkMix, setDarkMix] = useState(onHome ? 1 : 0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const header = document.querySelector("header");
      const band = header?.getBoundingClientRect().height ?? 80;
      let mix = 0;
      for (const el of document.querySelectorAll("[data-surface='dark']")) {
        const r = el.getBoundingClientRect();
        const top = Math.max(0, r.top);
        const bottom = Math.min(band, r.bottom);
        if (bottom > top) mix = Math.max(mix, (bottom - top) / band);
      }
      setDarkMix(reduced ? (mix > 0.5 ? 1 : 0) : mix);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const links = primaryNav.map((item) => ({
    href: href(locale, item.key),
    label: item.label[locale],
    emphasis: item.key === "work-with-us",
    navKey: item.key,
  }));
  const contact = links.find((l) => l.emphasis);
  const contactHash = onHome && contact ? homeHashHref(locale, contact.navKey) : null;
  const overlay = darkMix > 0.45;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 [--header-h:4.5rem] md:[--header-h:5rem]">
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Logo
            locale={locale}
            layout="compact"
            darkMix={darkMix}
            className="min-w-0 shrink xl:flex-none"
          />
          <div className="hidden items-center gap-2 rounded-full bg-white/90 px-2 py-1.5 shadow-[0_8px_32px_rgba(4,14,49,0.12)] backdrop-blur-md xl:flex">
            <DesktopNav locale={locale} links={links} label={m.primaryNav} pathname={pathname} onHome={onHome} spyKey={spyKey} />
            <LanguageSwitcher current={locale} label={m.language} className="px-2" />
            {contact ? (
              <Link
                href={contactHash ?? contact.href}
                onClick={(e) => {
                  if (contactHash && scrollToHomeHash(contactHash)) e.preventDefault();
                }}
                className="inline-flex h-9 items-center rounded-full bg-marine px-4 font-sans text-[0.9375rem] font-normal text-on-dark transition-colors duration-150 hover:bg-marine-2"
              >
                {contact.label}
              </Link>
            ) : null}
          </div>
          <MobileMenu
            locale={locale}
            links={links}
            pathname={pathname}
            onHome={onHome}
            spyKey={spyKey}
            overlay={overlay}
            labels={{ open: m.openMenu, close: m.closeMenu, menu: m.menu, language: m.language, languageNav: m.languageMenu }}
          />
        </div>
      </header>
      {onHome ? null : <div className="h-[5.5rem]" aria-hidden="true" />}
    </>
  );
}
