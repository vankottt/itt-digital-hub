"use client";

import Link from "next/link";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { locales, type Locale, localeLabels } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/paths";
import { cn } from "@/lib/cn";

/**
 * Homepage nav writes hashes (#about, #methodology, …). Next.js client
 * navigation keeps that hash when only the locale prefix changes, so the
 * other language lands in a section instead of the hero. The pending flag
 * survives a header remount and is not cleared in the effect cleanup —
 * React Strict Mode would otherwise swallow the first switch.
 */
let pendingLocaleSwitchTop = false;
let restoreScrollRestoration: (() => void) | null = null;

function scrollToDocumentTop() {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = prev;
  if (window.location.hash) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

export function prepareLocaleSwitchTop() {
  pendingLocaleSwitchTop = true;
  if ("scrollRestoration" in history && !restoreScrollRestoration) {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    restoreScrollRestoration = () => {
      history.scrollRestoration = previous;
      restoreScrollRestoration = null;
    };
  }
  scrollToDocumentTop();
}

/** Call once from the header so footer + header clicks share a single reset. */
export function useLocaleSwitchScrollToTop(locale: Locale) {
  const pathname = usePathname() || `/${locale}`;
  useLayoutEffect(() => {
    if (!pendingLocaleSwitchTop) return;
    scrollToDocumentTop();
    const onScroll = () => {
      if (window.scrollY > 1) scrollToDocumentTop();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const stop = window.setTimeout(() => {
      pendingLocaleSwitchTop = false;
      restoreScrollRestoration?.();
      window.removeEventListener("scroll", onScroll);
    }, 700);
    return () => {
      window.clearTimeout(stop);
      window.removeEventListener("scroll", onScroll);
    };
  }, [locale, pathname]);
}

/**
 * BG / EN switch preserving the current route. Renders both locales so the
 * active one is visible; the inactive one is a link with hreflang/lang.
 */
export function LanguageSwitcher({
  current,
  tone = "ink",
  label,
  className,
}: {
  current: Locale;
  tone?: "ink" | "on-dark";
  label: string;
  className?: string;
}) {
  const pathname = usePathname() || `/${current}`;
  const dark = tone === "on-dark";

  return (
    <nav aria-label={label} className={cn("flex items-center font-mono text-[0.75rem] uppercase tracking-[0.06em]", className)}>
      {locales.map((loc, i) => {
        const active = loc === current;
        return (
          <span key={loc} className="flex items-center">
            {i > 0 ? (
              <span aria-hidden="true" className={cn("mx-2 h-3 w-px", dark ? "bg-on-dark/30" : "bg-line-strong")} />
            ) : null}
            {active ? (
              <span aria-current="true" lang={localeLabels[loc].htmlLang} className={cn("font-medium", dark ? "text-on-dark" : "text-ink")}>
                {localeLabels[loc].short}
                <span className="sr-only"> — {localeLabels[loc].long}</span>
              </span>
            ) : (
              <Link
                href={switchLocalePath(pathname, loc)}
                hrefLang={localeLabels[loc].htmlLang}
                lang={localeLabels[loc].htmlLang}
                scroll
                onClick={prepareLocaleSwitchTop}
                className={cn(
                  "transition-colors duration-150",
                  dark ? "text-on-dark-muted hover:text-on-dark" : "text-ink-3 hover:text-ink",
                )}
              >
                {localeLabels[loc].short}
                <span className="sr-only"> — {localeLabels[loc].long}</span>
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
