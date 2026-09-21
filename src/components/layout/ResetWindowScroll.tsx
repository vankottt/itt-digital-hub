"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { isHomePath, isHomeSectionHash } from "@/lib/home-nav";
import { scrollToDocumentTop, setManualScrollRestoration } from "@/lib/scroll-to-top";
import { scrollToHomeHash } from "./useHomeSectionSpy";

const IOS_RESTORE_WINDOW_MS = 1200;

function landingHashHref(): string | null {
  const hash = window.location.hash;
  if (!isHomeSectionHash(hash)) return null;
  const path = window.location.pathname.replace(/\/$/, "") || "/bg";
  return `${path}${hash}`;
}

/**
 * Fresh `/bg` or `/en` must show the hero. iOS Safari otherwise restores the
 * last position. A real `#work` (header Work from Tools, hero CTA, refresh)
 * must keep that section — do not wipe the hash.
 */
export function ResetWindowScroll() {
  const pathname = usePathname() ?? "";

  useLayoutEffect(() => {
    setManualScrollRestoration();
    if (!isHomePath(window.location.pathname)) return;
    if (landingHashHref()) return;

    scrollToDocumentTop();

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const pinTop = () => {
      if (cancelled) return;
      if (!isHomePath(window.location.pathname)) return;
      if (landingHashHref()) return;
      if (window.scrollY > 1) scrollToDocumentTop();
    };

    window.addEventListener("scroll", pinTop, { passive: true });
    window.addEventListener("pageshow", pinTop);
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
      window.removeEventListener("pageshow", pinTop);
      window.removeEventListener("pointerdown", cancel, true);
      window.removeEventListener("keydown", cancel, true);
      window.removeEventListener("wheel", cancel, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isHomePath(pathname)) return;
    const target = landingHashHref();
    if (!target) {
      if (!window.location.hash) scrollToDocumentTop();
      return;
    }
    const run = () => scrollToHomeHash(target);
    run();
    const frame = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
