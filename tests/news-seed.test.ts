import { describe, expect, it } from "vitest";
import { getInsight, insights } from "../src/content/insights";
import { seedMedia, seedPartners, seedStore } from "../src/lib/cms/serialize";

describe("ITT editorial seed", () => {
  it("does not ship News, Insights, campus media or university partners", () => {
    expect(insights).toEqual([]);
    expect(getInsight("kogato-praktikata-vleze-v-universiteta")).toBeUndefined();
    expect(seedMedia()).toEqual([]);
    expect(seedPartners()).toEqual([]);
    expect(seedStore().insights).toEqual([]);
    expect(seedStore().media).toEqual([]);
    expect(seedStore().partners).toEqual([]);
  });
});
