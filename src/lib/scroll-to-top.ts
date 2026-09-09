/**
 * Pin the window to the top without CSS `scroll-behavior: smooth` fighting us.
 * iOS Safari otherwise restores the last position or a leftover `#work` hash.
 */
export function scrollToDocumentTop() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = prev;
}

export function clearLocationHash() {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

export function setManualScrollRestoration() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}
