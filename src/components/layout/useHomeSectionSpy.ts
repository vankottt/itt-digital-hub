"use client";

import { useSyncExternalStore } from "react";
import { homeSpySectionIds, navKeyForHomeSection } from "@/lib/home-nav";
import type { RouteKey } from "@/lib/paths";
import { useIsClient } from "@/lib/use-prefers-reduced-motion";

type SpyKey = Exclude<RouteKey, "home" | "privacy"> | null;

let cached: SpyKey = null;

function readActiveSection(): SpyKey {
  if (typeof document === "undefined") return null;
  if (document.body.style.overflow === "hidden") return cached;
  const header = document.querySelector("header");
  const headerH = header?.getBoundingClientRect().height ?? 88;
  const pad = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const line = Math.max(headerH, pad) + 8;
  let sectionId: string | null = null;
  for (const id of homeSpySectionIds) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) sectionId = id;
  }
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
  const lastId = homeSpySectionIds[homeSpySectionIds.length - 1];
  if (atBottom && lastId) sectionId = lastId;
  return sectionId ? navKeyForHomeSection(sectionId) : null;
}

function getSnapshot(): SpyKey {
  const next = readActiveSection();
  if (next === cached) return cached;
  cached = next;
  return cached;
}

function getDisabledSnapshot(): null {
  return null;
}

function subscribe(onStoreChange: () => void): () => void {
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onStoreChange();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  const ro = new ResizeObserver(onScroll);
  ro.observe(document.documentElement);
  onScroll();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    ro.disconnect();
    if (frame) cancelAnimationFrame(frame);
  };
}

function subscribeDisabled(): () => void {
  return () => undefined;
}

/**
 * Which primary-nav item matches the homepage section under the sticky header.
 * Disabled off the landing page so inner routes keep path-based current state.
 */
export function useHomeSectionSpy(enabled: boolean): SpyKey {
  const isClient = useIsClient();
  const live = enabled && isClient;
  return useSyncExternalStore(live ? subscribe : subscribeDisabled, live ? getSnapshot : getDisabledSnapshot, getDisabledSnapshot);
}

export function scrollToHomeHash(href: string): boolean {
  const id = href.split("#")[1];
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", href);
  window.dispatchEvent(new Event("scroll"));
  return true;
}
