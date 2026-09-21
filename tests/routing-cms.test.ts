import { describe, expect, it } from "vitest";
import { cmsMode } from "../src/lib/cms/mode";
import { insightRouteKey, normalizeInsightType } from "../src/lib/insight-channel";
import { defaultLocale } from "../src/lib/i18n";
import { href, switchLocalePath } from "../src/lib/paths";

describe("cms mode", () => {
  it("prefers supabase when url and key exist", () => {
    expect(cmsMode({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" })).toBe("supabase");
  });
  it("uses local adapter when a password is set, including on Vercel", () => {
    expect(cmsMode({ VERCEL: "1", CIT_ADMIN_DEV_PASSWORD: "secret" })).toBe("local");
  });
  it("uses local adapter off-Vercel when a password is set", () => {
    expect(cmsMode({ CIT_ADMIN_DEV_PASSWORD: "secret" })).toBe("local");
  });
  it("stays seed on Vercel without a password or Supabase", () => {
    expect(cmsMode({ VERCEL: "1" })).toBe("seed");
  });
});

describe("locale routing", () => {
  it("defaults the public site to Bulgarian", () => {
    expect(defaultLocale).toBe("bg");
  });

  it("builds locale paths", () => {
    expect(href("en", "methodology")).toBe("/en/methodology");
    expect(href("bg", "projects", "x")).toBe("/bg/projects/x");
    expect(href("bg", "news")).toBe("/bg/news");
    expect(href("en", "news", "opening")).toBe("/en/news/opening");
    expect(href("bg", "ai-act-agent")).toBe("/bg/ai-act-agent");
    expect(href("en", "ai-act-agent", "use")).toBe("/en/ai-act-agent/use");
    expect(href("bg", "tools")).toBe("/bg/tools");
    expect(href("en", "tools")).toBe("/en/tools");
  });
  it("switches locale prefix", () => {
    expect(switchLocalePath("/bg/methodology", "en")).toBe("/en/methodology");
    expect(switchLocalePath("/bg/news/opening", "en")).toBe("/en/news/opening");
  });
});

describe("insight channels", () => {
  it("maps news to the news route and everything else to insights", () => {
    expect(normalizeInsightType("news")).toBe("news");
    expect(normalizeInsightType("concept-note")).toBe("concept-note");
    expect(normalizeInsightType("article")).toBe("concept-note");
    expect(insightRouteKey("news")).toBe("news");
    expect(insightRouteKey(undefined)).toBe("insights");
  });
});
