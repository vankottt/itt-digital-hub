import { supabaseConfigured } from "@/lib/cms/mode";

export type LeadStorageTarget = "supabase" | "local" | "unavailable";

export function leadStorageTarget(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): LeadStorageTarget {
  if (supabaseConfigured(env)) return "supabase";
  if (env.VERCEL) return "unavailable";
  return "local";
}
