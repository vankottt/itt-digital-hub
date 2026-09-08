import { describe, expect, it } from "vitest";
import { DEV_PREVIEW_FALLBACK, DEV_SESSION_FALLBACK, resolvePreviewSecret, resolveSessionSecret } from "../src/lib/auth/secrets";
import { issuePreviewToken, readPreviewToken } from "../src/lib/preview-token";

describe("production signing secrets fail closed", () => {
  it("rejects missing and known development session secrets in production", () => {
    expect(resolveSessionSecret({ NODE_ENV: "production", VERCEL_ENV: "production" }).ok).toBe(false);
    expect(
      resolveSessionSecret({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        CIT_ADMIN_SESSION_SECRET: DEV_SESSION_FALLBACK,
      }).ok,
    ).toBe(false);
    expect(
      resolveSessionSecret({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        CIT_ADMIN_DEV_PASSWORD: "hosted-demo-password",
      }).ok,
    ).toBe(false);
  });

  it("accepts a dedicated production session secret", () => {
    const result = resolveSessionSecret({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      CIT_ADMIN_SESSION_SECRET: "production-session-key",
    });
    expect(result).toEqual({ ok: true, secret: "production-session-key" });
  });

  it("allows a configured preview password but never the hard-coded fallback", () => {
    expect(resolveSessionSecret({ NODE_ENV: "production", VERCEL_ENV: "preview" }).ok).toBe(false);
    expect(
      resolveSessionSecret({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        CIT_ADMIN_SESSION_SECRET: DEV_SESSION_FALLBACK,
      }).ok,
    ).toBe(false);
    expect(
      resolveSessionSecret({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        CIT_ADMIN_DEV_PASSWORD: "preview-demo-password",
      }),
    ).toEqual({ ok: true, secret: "preview-demo-password" });
  });

  it("keeps the local development fallback off the public internet", () => {
    expect(resolveSessionSecret({ NODE_ENV: "development" })).toEqual({ ok: true, secret: DEV_SESSION_FALLBACK });
    expect(resolvePreviewSecret({ NODE_ENV: "development" }).ok).toBe(true);
  });

  it("does not sign preview tokens with the known development string in production", () => {
    expect(resolvePreviewSecret({ NODE_ENV: "production", VERCEL_ENV: "production", CIT_PREVIEW_SECRET: DEV_PREVIEW_FALLBACK }).ok).toBe(false);
    expect(() => issuePreviewToken({ kind: "insight", slug: "x" }, 1000, { NODE_ENV: "production", VERCEL_ENV: "production" })).toThrow(/Preview signing material/);
  });

  it("round-trips preview tokens with a configured secret", () => {
    const env = { CIT_PREVIEW_SECRET: "unit-test-preview-secret" };
    const token = issuePreviewToken({ kind: "project", slug: "bulgarian-wine-bulgarian-tourism" }, undefined, env);
    expect(readPreviewToken(token, env)?.slug).toBe("bulgarian-wine-bulgarian-tourism");
    expect(readPreviewToken(token, { CIT_PREVIEW_SECRET: "other-secret" })).toBeNull();
  });
});
