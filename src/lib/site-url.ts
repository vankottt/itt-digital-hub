/**
 * Site origin for metadata, sitemap and robots.
 * No production domain is fixed yet; the value is resolved from the environment only.
 *
 * Preview deployments must not advertise the production host as canonical.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const vercel = env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
