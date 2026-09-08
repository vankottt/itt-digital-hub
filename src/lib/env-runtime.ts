/**
 * Deployment classification for secrets, indexing and URL resolution.
 * Vercel preview builds have NODE_ENV=production; VERCEL_ENV is the real signal.
 */
export type EnvMap = Record<string, string | undefined>;

export function envOf(env: EnvMap = process.env as EnvMap): EnvMap {
  return env;
}

export function vercelEnv(env: EnvMap = process.env as EnvMap): string | undefined {
  return env.VERCEL_ENV;
}

export function isVercelProduction(env: EnvMap = process.env as EnvMap): boolean {
  return vercelEnv(env) === "production";
}

export function isVercelPreview(env: EnvMap = process.env as EnvMap): boolean {
  return vercelEnv(env) === "preview";
}

/** Internet-facing Vercel deployment (production or preview). */
export function isInternetFacing(env: EnvMap = process.env as EnvMap): boolean {
  const value = vercelEnv(env);
  return value === "production" || value === "preview";
}

/**
 * Hard-coded development signing strings are allowed only in local
 * development/test. Production builds and Vercel preview/production never
 * use them — including `next start` with NODE_ENV=production.
 */
export function allowsDevSigningFallback(env: EnvMap = process.env as EnvMap): boolean {
  if (isInternetFacing(env)) return false;
  if (env.NODE_ENV === "production") return false;
  return true;
}
