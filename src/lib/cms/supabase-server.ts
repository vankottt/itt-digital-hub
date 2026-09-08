import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function supabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url, key };
}

/** Cookie-free client for public reads and static generation. RLS still applies. */
export function createSupabaseAnonClient(): SupabaseClient {
  const { url, key } = supabaseCredentials();
  return createClient(url, key);
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, key } = supabaseCredentials();
  try {
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* set from a Server Component during render — session refresh happens in proxy */
          }
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Dynamic server usage")) return createSupabaseAnonClient();
    throw error;
  }
}
