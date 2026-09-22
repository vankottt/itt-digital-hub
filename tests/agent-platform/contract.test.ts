import { describe, expect, it } from "vitest";
import { readBodyWithLimit, parseAllowedOrigins, parseChatPayload, signRequest } from "../../platform/shared/src/index";
import { redact } from "../../platform/agent-hub/src/log";
import { nodeHmac } from "./helpers";

describe("agent platform contract", () => {
  it("signs with the same HMAC as Node crypto", async () => {
    const body = new TextEncoder().encode('{"message":"hello"}');
    const parts = {
      secret: "test-hub-shared-secret",
      timestamp: "1700000000",
      method: "POST",
      path: "/v1/agents/mock/chat",
      requestId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      body,
    };
    expect(await signRequest(parts)).toBe(nodeHmac(parts));
  });

  it("accepts a chat payload and rejects an empty message", () => {
    expect(parseChatPayload({ message: " hello ", locale: "bg" })).toEqual({
      ok: true,
      value: { locale: "bg", message: "hello", history: [] },
    });
    expect(parseChatPayload({})).toEqual({ ok: false, code: "INVALID_BODY" });
    expect(parseChatPayload({ message: "x".repeat(4001) })).toEqual({ ok: false, code: "MESSAGE_TOO_LONG" });
  });

  it("drops wildcard origins", () => {
    expect(parseAllowedOrigins("*")).toEqual(["https://ittdigitalhub.org", "http://localhost:3000"]);
    expect(parseAllowedOrigins("https://ittdigitalhub.org, *")).toEqual(["https://ittdigitalhub.org"]);
  });

  it("stops reading a body past the limit", async () => {
    const request = new Request("https://example.test/post", { method: "POST", body: "12345" });
    const result = await readBodyWithLimit(request, 4);
    expect(result.ok).toBe(false);
  });

  it("redacts secrets and conversation fields", () => {
    expect(
      redact({
        message: "request",
        secret: "hidden-secret",
        authorization: "Bearer hidden",
        history: ["hello"],
        apiKey: "sk-test",
        token: "gate-token",
        inputTokens: 12,
        outputTokens: 4,
      }),
    ).toEqual({
      message: "request",
      secret: "[redacted]",
      authorization: "[redacted]",
      history: "[redacted]",
      apiKey: "[redacted]",
      token: "[redacted]",
      inputTokens: 12,
      outputTokens: 4,
    });
  });
});
