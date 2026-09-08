/**
 * Indexing is opt-in. Preview, staging and the current Vercel alias stay
 * noindex until an explicit production launch sets ITT_ALLOW_INDEXING=true.
 */
export function allowPublicIndexing(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): boolean {
  if (env.ITT_ALLOW_INDEXING !== "true" && env.CIT_ALLOW_INDEXING !== "true") return false;
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") return false;
  return true;
}

export function robotsDirective(indexable: boolean): { index: boolean; follow: boolean } {
  return indexable ? { index: true, follow: true } : { index: false, follow: false };
}

export function isAlwaysNoIndexPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/preview" || pathname.startsWith("/preview/");
}
