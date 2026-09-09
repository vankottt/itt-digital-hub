"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { RouteKey } from "@/lib/paths";
import { homeHashHref, isActivePath } from "@/lib/home-nav";
import { cn } from "@/lib/cn";
import { scrollToHomeHash } from "./useHomeSectionSpy";

export interface NavLink {
  href: string;
  label: string;
  emphasis?: boolean;
  navKey: RouteKey;
}

export function DesktopNav({
  locale,
  links,
  label,
  pathname,
  onHome,
  spyKey,
}: {
  locale: Locale;
  links: NavLink[];
  label: string;
  pathname: string;
  onHome: boolean;
  spyKey: RouteKey | null;
}) {
  const items = links.filter((l) => !l.emphasis);

  return (
    <nav aria-label={label} className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {items.map((l) => {
          const hashHref = onHome ? homeHashHref(locale, l.navKey) : null;
          const href = hashHref ?? l.href;
          const active = onHome ? spyKey === l.navKey : isActivePath(pathname, l.href);
          return (
            <li key={l.navKey}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  if (hashHref && scrollToHomeHash(hashHref)) e.preventDefault();
                }}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3.5 font-sans text-[0.9375rem] font-light transition-colors duration-150",
                  active ? "text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
