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

function stickyHeaderHeight(): number {
  const header = document.querySelector("header");
  return header?.getBoundingClientRect().height ?? 80;
}

function restoreScrollBehavior(root: HTMLElement, previous: string) {
  root.style.scrollBehavior = previous;
}

/**
 * Align the section heading just below the sticky header.
 * `scrollIntoView({ block: "start" })` uses the section box plus `scroll-padding-top`,
 * so the section's own `py-section` reads as empty space and the lower content is clipped.
 */
export function scrollToHomeHash(href: string): boolean {
  const id = href.split("#")[1];
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const next = href.startsWith("/") ? href : `${window.location.pathname}#${id}`;
  history.replaceState(null, "", next);
  const headerH = stickyHeaderHeight();
  const padTop = Number.parseFloat(getComputedStyle(el).paddingTop) || 0;
  const top = Math.max(0, window.scrollY + el.getBoundingClientRect().top + padTop - headerH - 8);
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  if (reduce) {
    restoreScrollBehavior(root, previous);
  } else {
    const restore = () => restoreScrollBehavior(root, previous);
    window.addEventListener("scrollend", restore, { once: true });
    window.setTimeout(restore, 900);
  }
  window.dispatchEvent(new Event("scroll"));
  return true;
}
