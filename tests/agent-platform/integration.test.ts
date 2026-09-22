import { describe, expect, it } from "vitest";
import { handleGateway } from "../../platform/gateway/src/handler";
import { createLogger } from "../../platform/agent-hub/src/log";
import { startAgentHub } from "../../platform/agent-hub/src/server";
import { chatBody, gatewayEnv, quietLog, readError, readSuccess, SECRET } from "./helpers";

describe("gateway to hub", () => {
  it("answers a browser-style request through the mock agent", async () => {
    const lines: string[] = [];
    const hub = await startAgentHub({
      host: "127.0.0.1",
      port: 0,
      secret: SECRET,
      log: createLogger({ level: "info", write: (line) => lines.push(line) }),
    });
    try {
      const response = await handleGateway(
        new Request("https://api.ittdigitalhub.org/v1/agents/mock/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://localhost:3000",
          },
          body: chatBody("hello"),
        }),
        gatewayEnv({ AGENT_HUB_ORIGIN: hub.origin, UPSTREAM_TIMEOUT_MS: "5000" }),
        { log: () => undefined },
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
      const body = await readSuccess(response);
      expect(body.agentId).toBe("mock");
      expect(body.answer).toBe("mock:hello");
      expect(body.requestId).toBe(response.headers.get("x-itt-request-id"));
      expect(body.answer).not.toContain("LOCAL_KNOWLEDGE_MARKER");
      expect(lines.join("\n")).not.toContain(SECRET);
    } finally {
      await hub.close();
    }
  });

  it("returns an unknown agent and hides a bad signature", async () => {
    const hub = await startAgentHub({
      host: "127.0.0.1",
      port: 0,
      secret: SECRET,
      log: quietLog(),
    });
    try {
      const missing = await handleGateway(
        new Request("https://api.ittdigitalhub.org/v1/agents/missing/chat", {
          method: "POST",
          headers: { "content-type": "application/json", origin: "https://ittdigitalhub.org" },
          body: chatBody("hello"),
        }),
        gatewayEnv({ AGENT_HUB_ORIGIN: hub.origin, UPSTREAM_TIMEOUT_MS: "5000" }),
        { log: () => undefined },
      );
      expect((await readError(missing)).error.code).toBe("AGENT_NOT_FOUND");

      const denied = await handleGateway(
        new Request("https://api.ittdigitalhub.org/v1/agents/mock/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: chatBody("hello"),
        }),
        gatewayEnv({
          AGENT_HUB_ORIGIN: hub.origin,
          AGENT_HUB_SHARED_SECRET: "different-test-secret-value",
          UPSTREAM_TIMEOUT_MS: "5000",
        }),
        { log: () => undefined },
      );
      const text = await denied.text();
      expect(denied.status).toBe(502);
      expect(text).toContain("UPSTREAM_UNAVAILABLE");
      expect(text).not.toContain("INVALID_SIGNATURE");
      expect(text).not.toContain("different-test-secret-value");
    } finally {
      await hub.close();
    }
  });
});
