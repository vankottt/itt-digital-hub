import { describe, expect, it } from "vitest";
import { issuePreviewToken, readPreviewToken } from "../src/lib/preview-token";

describe("preview tokens", () => {
  it("round-trips a grant", () => {
    const token = issuePreviewToken({ kind: "project", slug: "bulgarian-wine-bulgarian-tourism" });
    const grant = readPreviewToken(token);
    expect(grant?.kind).toBe("project");
    expect(grant?.slug).toBe("bulgarian-wine-bulgarian-tourism");
  });

  it("rejects tampered tokens", () => {
    const token = issuePreviewToken({ kind: "insight", slug: "x" });
    expect(readPreviewToken(token.slice(0, -2) + "zz")).toBeNull();
    expect(readPreviewToken(undefined)).toBeNull();
  });
});
