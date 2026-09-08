import { describe, expect, it } from "vitest";
import { DEV_NEWS_FIXTURE_SLUGS, devNewsFixtures } from "../src/content/dev-news-fixtures";
import { applyDevNewsFixtures } from "../src/lib/cms/dev-news-overlay";
import { applyMissingSeedContent } from "../src/lib/cms/seed-overlay";
import { seedStore } from "../src/lib/cms/serialize";

function emptyBundle() {
  return { insights: [] as ReturnType<typeof seedStore>["insights"], media: [] as ReturnType<typeof seedStore>["media"] };
}

describe("demo news fixtures", () => {
  it("does not overlay demonstration News on ITT", () => {
    expect(DEV_NEWS_FIXTURE_SLUGS).toEqual([]);
    expect(devNewsFixtures).toEqual([]);
    expect(applyDevNewsFixtures(emptyBundle()).insights).toEqual([]);
    expect(applyDevNewsFixtures(emptyBundle()).media).toEqual([]);
  });

  it("keeps CMS seed overlays empty when the store is empty", () => {
    const restored = applyDevNewsFixtures(applyMissingSeedContent(emptyBundle()));
    expect(restored.insights).toEqual([]);
    expect(restored.media).toEqual([]);
  });
});
