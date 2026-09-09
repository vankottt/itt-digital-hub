"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { RouteKey } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type NavLink } from "./DesktopNav";
import { homeHashHref, isActivePath } from "@/lib/home-nav";
import { scrollToHomeHash } from "./useHomeSectionSpy";

export function MobileMenu({
  locale,
  links,
  labels,
  pathname,
  onHome,
  spyKey,
  overlay = false,
}: {
  locale: Locale;
  links: NavLink[];
  labels: { open: string; close: string; menu: string; language: string; languageNav: string };
  pathname: string;
  onHome: boolean;
  spyKey: RouteKey | null;
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pendingHashRef = useRef<string | null>(null);

  // Escape closes; lock body scroll; inert the rest of the page; move focus into the panel.
  useEffect(() => {
    const main = document.getElementById("main");
    const footer = document.querySelector("footer");
    if (!open) {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      const pending = pendingHashRef.current;
      if (pending) {
        pendingHashRef.current = null;
        requestAnimationFrame(() => {
          scrollToHomeHash(pending);
        });
      }
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150",
          overlay ? "text-on-dark hover:bg-white/10" : "text-ink hover:bg-white/70",
        )}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className={cn(
          "fixed inset-x-0 top-[4.75rem] bottom-0 z-40 overflow-y-auto bg-paper",
          open && "motion-safe:animate-[menu-in_180ms_var(--ease-out-soft)]",
        )}
      >
        <nav aria-label={labels.menu} className="container-site pt-4 pb-10">
          <ul className="grid gap-1 pt-2">
            {links.map((l, i) => {
              const hashHref = onHome ? homeHashHref(locale, l.navKey) : null;
              const href = hashHref ?? l.href;
              const active = onHome ? spyKey === l.navKey : isActivePath(pathname, l.href);
              return (
              <li key={l.navKey}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    if (hashHref) {
                      e.preventDefault();
                      pendingHashRef.current = hashHref;
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-full px-4 py-3 font-sans text-[1.5rem] font-light leading-tight text-ink transition-colors duration-150 hover:bg-white",
                    l.emphasis && "font-normal",
                    active && "bg-white",
                  )}
                >
                  {l.label}
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-signal" : "bg-transparent")} />
                </Link>
              </li>
              );
            })}
          </ul>
          <div
            className="mt-8 flex items-center justify-between"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <span className="label">{labels.language}</span>
            <LanguageSwitcher current={locale} label={labels.languageNav} />
          </div>
        </nav>
      </div>
    </div>
  );
}
