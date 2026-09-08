import type { CmsMode } from "./types";

/**
 * - supabase: NEXT_PUBLIC_SUPABASE_URL + anon/publishable key
 * - local:   CIT_ADMIN_DEV_PASSWORD set (file store; on Vercel this is /tmp and ephemeral)
 * - seed:    read-only TypeScript content, no admin sign-in
 */
export function cmsMode(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): CmsMode {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) return "supabase";
  if (env.CIT_ADMIN_DEV_PASSWORD) return "local";
  return "seed";
}

export function hostedDemoStore(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): boolean {
  return Boolean(env.VERCEL) && cmsMode(env) === "local";
}

export function supabaseConfigured(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): boolean {
  return cmsMode(env) === "supabase";
}

export function localAdminEnabled(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): boolean {
  return cmsMode(env) === "local";
}
