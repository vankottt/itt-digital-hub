import type { ReactNode } from "react";

/**
 * Root pass-through layout. The <html>/<body> shell is rendered by
 * src/app/[locale]/layout.tsx so that `lang` matches the locale.
 * src/app/not-found.tsx renders its own shell for non-localized paths.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
