import { describe, expect, it } from "vitest";
import { getContentSourceSnapshot, recordContentSource, resetContentSourceSnapshot } from "../src/lib/cms/content-source";
import { siteUrl } from "../src/lib/site-url";

describe("CMS content source diagnostics", () => {
  it("records seed fallback without throwing", () => {
    resetContentSourceSnapshot();
    recordContentSource("seed-fallback", "connection refused");
    expect(getContentSourceSnapshot()).toMatchObject({
      source: "seed-fallback",
      fallbackReason: "connection refused",
    });
    resetContentSourceSnapshot();
  });
});

describe("site URL resolution", () => {
  it("prefers an explicit public origin", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.org/" })).toBe("https://example.org");
  });

  it("does not use the production host as the preview canonical", () => {
    expect(
      siteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "cit-preview.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "cit.example.org",
      }),
    ).toBe("https://cit-preview.vercel.app");
  });

  it("uses the production host only on production deployments", () => {
    expect(
      siteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "cit.example.org",
        VERCEL_URL: "cit-website-abc.vercel.app",
      }),
    ).toBe("https://cit.example.org");
  });
});
