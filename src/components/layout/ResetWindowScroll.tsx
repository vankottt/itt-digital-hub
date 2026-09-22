"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { isHomePath, isHomeSectionHash } from "@/lib/home-nav";
import { scrollToDocumentTop, setManualScrollRestoration } from "@/lib/scroll-to-top";
import { scrollToHomeHash } from "./useHomeSectionSpy";

const IOS_RESTORE_WINDOW_MS = 1200;

/** Survives Strict Mode remount; resets on full document load. */
let homeHashFromClientNav = false;

function landingHashHref(): string | null {
  const hash = window.location.hash;
  if (!isHomeSectionHash(hash)) return null;
  const path = window.location.pathname.replace(/\/$/, "") || "/bg";
  return `${path}${hash}`;
}

function markHomeHashFromClientNav() {
  homeHashFromClientNav = true;
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
    if (!isHomePath(pathname)) {
      markHomeHashFromClientNav();
      return;
    }
    const target = landingHashHref();
    if (!target) {
      markHomeHashFromClientNav();
      if (!window.location.hash) scrollToDocumentTop();
      return;
    }

    // Native fragment + Next.js layout-router use scrollIntoView() (section box
    // + scroll-padding-top). This node is last in SiteChrome so we overwrite
    // that in the same layout pass. Instant on document load so we do not
    // animate from the native landing. Client nav (Tools → #work) stays smooth.
    const instant = !homeHashFromClientNav;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      scrollToHomeHash(target, instant ? { instant: true } : undefined);
    };
    run();
    const frame = window.requestAnimationFrame(run);
    if (!instant) {
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frame);
      };
    }

    const zero = window.setTimeout(() => {
      run();
      markHomeHashFromClientNav();
    }, 0);
    const onLateNativeHash = () => run();
    const detach = () => {
      window.clearTimeout(zero);
      window.removeEventListener("pageshow", onLateNativeHash);
      window.removeEventListener("load", onLateNativeHash);
      window.removeEventListener("pointerdown", onUserIntent, true);
      window.removeEventListener("keydown", onUserIntent, true);
      window.removeEventListener("wheel", onUserIntent, true);
    };
    const onUserIntent = () => {
      cancelled = true;
      markHomeHashFromClientNav();
      detach();
    };
    window.addEventListener("pageshow", onLateNativeHash);
    if (document.readyState !== "complete") {
      window.addEventListener("load", onLateNativeHash);
    }
    window.addEventListener("pointerdown", onUserIntent, { capture: true, once: true, passive: true });
    window.addEventListener("keydown", onUserIntent, { capture: true, once: true });
    window.addEventListener("wheel", onUserIntent, { capture: true, once: true, passive: true });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      detach();
    };
  }, [pathname]);

  useLayoutEffect(() => {
    if (!isHomePath(pathname)) return undefined;
    const onHashChange = () => {
      const target = landingHashHref();
      if (target) scrollToHomeHash(target, { instant: true });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return null;
}
