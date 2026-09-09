"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { isHomePath, isHomeSectionHash } from "@/lib/home-nav";
import { clearLocationHash, scrollToDocumentTop, setManualScrollRestoration } from "@/lib/scroll-to-top";

const IOS_RESTORE_WINDOW_MS = 1200;

/**
 * Opening /bg, /en, or a leftover /bg#work must show the hero, not the work
 * band. In-page nav still scrolls after the user taps Work / a hero CTA —
 * those gestures cancel this pin.
 */
export function ResetWindowScroll() {
  const pathname = usePathname() ?? "";

  useLayoutEffect(() => {
    setManualScrollRestoration();
    if (!isHomePath(window.location.pathname)) return;

    scrollToDocumentTop();
    if (isHomeSectionHash(window.location.hash)) clearLocationHash();

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const pinTop = () => {
      if (cancelled) return;
      if (!isHomePath(window.location.pathname)) return;
      if (window.scrollY > 1) scrollToDocumentTop();
      if (isHomeSectionHash(window.location.hash)) clearLocationHash();
    };
    const onPageShow = () => pinTop();

    window.addEventListener("scroll", pinTop, { passive: true });
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pointerdown", cancel, { capture: true, once: true, passive: true });
    window.addEventListener("keydown", cancel, { capture: true, once: true });
    window.addEventListener("wheel", cancel, { capture: true, once: true, passive: true });

    const frame = window.requestAnimationFrame(pinTop);
    const stop = window.setTimeout(() => {
      cancelled = true;
      window.removeEventListener("scroll", pinTop);
    }, IOS_RESTORE_WINDOW_MS);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stop);
      window.removeEventListener("scroll", pinTop);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pointerdown", cancel, true);
      window.removeEventListener("keydown", cancel, true);
      window.removeEventListener("wheel", cancel, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) return;
    scrollToDocumentTop();
  }, [pathname]);

  return null;
}
