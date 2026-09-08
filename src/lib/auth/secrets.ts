import { allowsDevSigningFallback, isVercelProduction, type EnvMap } from "@/lib/env-runtime";

/** Known development-only strings. Never valid as production or preview signing keys. */
export const DEV_SESSION_FALLBACK = "cit-dev-session-not-for-production";
export const DEV_PREVIEW_FALLBACK = "cit-preview-dev";

const KNOWN_DEV_SECRETS = new Set([DEV_SESSION_FALLBACK, DEV_PREVIEW_FALLBACK]);

export interface SecretResolution {
  ok: true;
  secret: string;
}

export interface SecretFailure {
  ok: false;
  error: string;
}

export type SecretResult = SecretResolution | SecretFailure;

function configured(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function rejectKnownDevSecret(value: string | undefined, env: EnvMap): string | undefined {
  if (!value) return undefined;
  if (!KNOWN_DEV_SECRETS.has(value)) return value;
  if (allowsDevSigningFallback(env)) return value;
  return undefined;
}

/**
 * HMAC key for `/admin` cookie sessions.
 * Production (VERCEL_ENV=production) requires CIT_ADMIN_SESSION_SECRET.
 * Preview/local may use that secret or CIT_ADMIN_DEV_PASSWORD.
 * The hard-coded development string is local-dev/test only.
 */
export function resolveSessionSecret(env: EnvMap = process.env as EnvMap): SecretResult {
  const dedicated = rejectKnownDevSecret(configured(env.CIT_ADMIN_SESSION_SECRET), env);
  if (dedicated) return { ok: true, secret: dedicated };

  if (isVercelProduction(env)) {
    return {
      ok: false,
      error: "CIT_ADMIN_SESSION_SECRET is required in production and must not be a known development fallback.",
    };
  }

  const password = rejectKnownDevSecret(configured(env.CIT_ADMIN_DEV_PASSWORD), env);
  if (password) return { ok: true, secret: password };

  if (allowsDevSigningFallback(env)) {
    return { ok: true, secret: DEV_SESSION_FALLBACK };
  }

  return {
    ok: false,
    error: "Admin session signing material is not configured. Set CIT_ADMIN_SESSION_SECRET (production) or CIT_ADMIN_DEV_PASSWORD (development).",
  };
}

/**
 * HMAC key for draft preview cookies.
 * Prefers CIT_PREVIEW_SECRET, then the session secret, then the local password.
 * Never falls through to a known development string on production or preview.
 */
export function resolvePreviewSecret(env: EnvMap = process.env as EnvMap): SecretResult {
  const dedicated = rejectKnownDevSecret(configured(env.CIT_PREVIEW_SECRET), env);
  if (dedicated) return { ok: true, secret: dedicated };

  const session = resolveSessionSecret(env);
  if (session.ok && !KNOWN_DEV_SECRETS.has(session.secret)) return session;
  if (session.ok && allowsDevSigningFallback(env)) return session;

  if (allowsDevSigningFallback(env)) {
    return { ok: true, secret: DEV_PREVIEW_FALLBACK };
  }

  return {
    ok: false,
    error: "Preview signing material is not configured. Set CIT_PREVIEW_SECRET or CIT_ADMIN_SESSION_SECRET.",
  };
}

export function requireSessionSecret(env?: EnvMap): string {
  const result = resolveSessionSecret(env);
  if (!result.ok) throw new Error(result.error);
  return result.secret;
}

export function requirePreviewSecret(env?: EnvMap): string {
  const result = resolvePreviewSecret(env);
  if (!result.ok) throw new Error(result.error);
  return result.secret;
}
