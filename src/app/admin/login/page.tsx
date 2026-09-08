import { cmsMode, hostedDemoStore } from "@/lib/cms/mode";
import { loginAction } from "../actions";
import { Mark } from "@/components/layout/Logo";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const mode = cmsMode();
  return (
    <main className="admin-main" style={{ maxWidth: 28 * 16, margin: "10vh auto" }}>
      <Mark size={58} />
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "2rem", margin: "1rem 0 0.5rem" }}>CIT administration</h1>
      <p className="admin-muted">Structured content only. The public design is not edited here.</p>
      {mode === "seed" ? (
        <p className="admin-card" style={{ marginTop: "1.5rem" }}>
          CMS credentials are not configured. For local editing set <code>CIT_ADMIN_DEV_PASSWORD</code> and restart. For hosted Auth
          set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. See docs/SUPABASE.md.
        </p>
      ) : null}
      {hostedDemoStore() ? (
        <p className="admin-card" style={{ marginTop: "1.5rem" }}>
          Hosted demo until Supabase is connected. Saves on this deployment are temporary. Use the demo accounts below.
        </p>
      ) : null}
      <form action={loginAction} className="admin-form admin-card" style={{ marginTop: "1.5rem" }}>
        {error ? <p role="alert">{decodeURIComponent(error)}</p> : null}
        <label>
          Email
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        <button type="submit" className="admin-btn" disabled={mode === "seed"}>
          Sign in
        </button>
        {mode === "local" ? (
          <p className="admin-muted">
            Users: <code>admin@cit.local</code> (full access) or <code>editor@cit.local</code> (editor).{" "}
            {hostedDemoStore() ? (
              <>
                Password: <code>{process.env.CIT_ADMIN_DEV_PASSWORD}</code>
              </>
            ) : (
              <>Password: the value of <code>CIT_ADMIN_DEV_PASSWORD</code> in <code>.env.local</code>.</>
            )}
          </p>
        ) : null}
        {mode === "supabase" ? (
          <p className="admin-muted">Staff accounts are stored in Supabase Auth. Only emails listed in <code>staff</code> can sign in.</p>
        ) : null}
      </form>
    </main>
  );
}
