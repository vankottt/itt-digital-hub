import { describe, expect, it } from "vitest";
import { allowPublicIndexing, isAlwaysNoIndexPath, robotsDirective } from "../src/lib/indexing";

describe("indexing policy", () => {
  it("is noindex unless ITT_ALLOW_INDEXING is true", () => {
    expect(allowPublicIndexing({})).toBe(false);
    expect(allowPublicIndexing({ ITT_ALLOW_INDEXING: "true" })).toBe(true);
    expect(allowPublicIndexing({ ITT_ALLOW_INDEXING: "true", VERCEL_ENV: "preview" })).toBe(false);
    expect(allowPublicIndexing({ ITT_ALLOW_INDEXING: "true", VERCEL_ENV: "production" })).toBe(true);
  });

  it("always noindexes admin and preview paths", () => {
    expect(isAlwaysNoIndexPath("/admin")).toBe(true);
    expect(isAlwaysNoIndexPath("/admin/projects/x")).toBe(true);
    expect(isAlwaysNoIndexPath("/preview/en/x")).toBe(true);
    expect(isAlwaysNoIndexPath("/en")).toBe(false);
  });

  it("maps to robots metadata", () => {
    expect(robotsDirective(false)).toEqual({ index: false, follow: false });
    expect(robotsDirective(true)).toEqual({ index: true, follow: true });
  });
});
