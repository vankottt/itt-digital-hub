"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { SiteHeader } from "./SiteHeader";
import { SiteFooterGate } from "./SiteFooterGate";
import { ResetWindowScroll } from "./ResetWindowScroll";

export function SiteChrome({
  locale,
  skipLabel,
  children,
}: {
  locale: Locale;
  skipLabel: string;
  children: ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-on-dark"
      >
        {skipLabel}
      </a>
      <SiteHeader locale={locale} />
      <main id="main" className="min-w-0 w-full flex-1">
        {children}
      </main>
      <SiteFooterGate locale={locale} />
      <ResetWindowScroll />
    </>
  );
}
