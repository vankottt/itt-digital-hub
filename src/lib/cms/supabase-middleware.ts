import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh the Supabase Auth cookies on each request so RLS writes keep working
 * after the access token expires. Mirrors the official @supabase/ssr proxy pattern.
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  let outgoing = response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        outgoing = NextResponse.next({ request });
        response.headers.forEach((value, header) => {
          if (header.toLowerCase() === "set-cookie") return;
          outgoing.headers.set(header, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          outgoing.cookies.set(name, value, options);
        });
      },
    },
  });
  await supabase.auth.getUser();
  return outgoing;
}
