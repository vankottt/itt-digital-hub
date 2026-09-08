import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/cms/supabase-middleware";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n";
import { allowPublicIndexing, isAlwaysNoIndexPath } from "@/lib/indexing";

/**
 * Locale routing:
 *  - "/"            → redirect to the negotiated locale (Accept-Language), default bg
 *  - "/about" etc.  → redirect to "/<locale>/about" (same negotiation)
 *  - "/bg/…", "/en/…" pass through
 * Static assets and Next internals are excluded by the matcher.
 */
function negotiate(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? Number.parseFloat(q.split("=")[1] ?? "1") : 1;
      return { lang: (tag ?? "").toLowerCase().split("-")[0] ?? "", weight, index };
    })
    .filter((r) => r.lang)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const r of ranked) {
    if (isLocale(r.lang)) return r.lang;
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  const pass = NextResponse.next({ request });
  if (!allowPublicIndexing() || isAlwaysNoIndexPath(pathname)) {
    pass.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (locales.includes(first as Locale) || pathname.startsWith("/admin") || pathname.startsWith("/preview")) {
    return refreshSupabaseSession(request, pass);
  }

  const locale = negotiate(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const redirect = NextResponse.redirect(url, 307);
  if (!allowPublicIndexing()) redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
  return redirect;
}

export const config = {
  matcher: ["/((?!_next|api|icon.png|apple-icon.png|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)"],
};
