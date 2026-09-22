import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { handleGateway } from "../../platform/gateway/src/handler";
import { DEV_PLACEHOLDER_SECRET, verifySignature } from "../../platform/shared/src/index";
import { chatBody, gatewayEnv, readError, SECRET } from "./helpers";

function postChat(body: string, origin = "https://ittdigitalhub.org"): Request {
  return new Request("https://api.ittdigitalhub.org/v1/agents/mock/chat", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body,
  });
}

describe("agent gateway", () => {
  it("returns a public health payload", async () => {
    const response = await handleGateway(new Request("https://api.ittdigitalhub.org/v1/health"), gatewayEnv(), {
      fetch: () => Promise.reject(new Error("health must not call the hub")),
      log: () => undefined,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", service: "itt-agent-gateway" });
  });

  it("rejects a non-POST chat call", async () => {
    const response = await handleGateway(new Request("https://api.ittdigitalhub.org/v1/agents/mock/chat"), gatewayEnv(), {
      log: () => undefined,
    });
    expect(response.status).toBe(405);
    expect((await readError(response)).error.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("rejects an invalid body", async () => {
    const response = await handleGateway(postChat("{}"), gatewayEnv(), { log: () => undefined });
    expect(response.status).toBe(400);
    expect((await readError(response)).error.code).toBe("INVALID_BODY");
  });

  it("rejects an origin that is not allowed", async () => {
    let called = false;
    const response = await handleGateway(postChat(chatBody(), "https://evil.example"), gatewayEnv(), {
      fetch: () => {
        called = true;
        return Promise.reject(new Error("must not proxy"));
      },
      log: () => undefined,
    });
    expect(called).toBe(false);
    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect((await readError(response)).error.code).toBe("ORIGIN_NOT_ALLOWED");
  });

  it("signs the raw body and does not use a wildcard CORS header", async () => {
    const raw = '{ "locale" : "en", "message" : "hello" }';
    let captured: { url: string; headers: Headers; body: Uint8Array } | undefined;
    const response = await handleGateway(postChat(raw, "http://localhost:3000"), gatewayEnv(), {
      now: () => 1_700_000_000_000,
      log: () => undefined,
      fetch: async (input, init) => {
        const request = new Request(input, init);
        captured = {
          url: request.url,
          headers: request.headers,
          body: new Uint8Array(await request.arrayBuffer()),
        };
        return new Response(JSON.stringify({ requestId: "ignored", agentId: "mock", sessionId: "s", answer: "mock:hello" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
    expect(captured?.url).toBe("http://127.0.0.1:9/v1/agents/mock/chat");
    expect(new TextDecoder().decode(captured?.body ?? new Uint8Array())).toBe(raw);
    const verdict = await verifySignature({
      secret: SECRET,
      timestamp: captured?.headers.get("x-itt-timestamp") ?? "",
      method: "POST",
      path: "/v1/agents/mock/chat",
      requestId: captured?.headers.get("x-itt-request-id") ?? "",
      body: captured?.body ?? new Uint8Array(),
      signature: captured?.headers.get("x-itt-signature") ?? "",
      nowSeconds: 1_700_000_000,
    });
    expect(verdict).toBe("ok");
    expect(await response.json()).toMatchObject({ answer: "mock:hello" });
  });

  it("reports an unreachable hub without leaking the target", async () => {
    const logs: string[] = [];
    const response = await handleGateway(postChat(chatBody()), gatewayEnv(), {
      log: (fields) => logs.push(JSON.stringify(fields)),
      fetch: () => Promise.reject(new TypeError("connect ECONNREFUSED 10.1.2.3")),
    });
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).toContain("UPSTREAM_UNAVAILABLE");
    expect(body).not.toContain("10.1.2.3");
    expect(logs.join("\n")).not.toContain(SECRET);
  });

  it("reports an upstream timeout", async () => {
    const response = await handleGateway(postChat(chatBody()), gatewayEnv({ UPSTREAM_TIMEOUT_MS: "50" }), {
      log: () => undefined,
      fetch: (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          if (!signal) return;
          const fail = () => reject(signal.reason ?? new DOMException("timed out", "TimeoutError"));
          if (signal.aborted) fail();
          else signal.addEventListener("abort", fail, { once: true });
        }),
    });
    expect(response.status).toBe(504);
    expect((await readError(response)).error.code).toBe("UPSTREAM_TIMEOUT");
  });

  it("hides hub authentication failures from the browser", async () => {
    const response = await handleGateway(postChat(chatBody()), gatewayEnv(), {
      log: () => undefined,
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "INVALID_SIGNATURE",
              message: "Request could not be authenticated.",
              requestId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
            },
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
    });
    expect(response.status).toBe(502);
    expect((await readError(response)).error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("passes a normalized unknown-agent error", async () => {
    const response = await handleGateway(postChat(chatBody()), gatewayEnv(), {
      log: () => undefined,
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "AGENT_NOT_FOUND",
              message: "Agent is not available.",
              requestId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
            },
          }),
          { status: 404, headers: { "content-type": "application/json" } },
        ),
    });
    expect(response.status).toBe(404);
    expect((await readError(response)).error.message).toBe("Agent is not available.");
  });

  it("does not forward an upstream stack or path", async () => {
    const response = await handleGateway(postChat(chatBody()), gatewayEnv(), {
      log: () => undefined,
      fetch: async () =>
        new Response(JSON.stringify({ error: { code: "INTERNAL", message: "Error: /Users/secret/key", requestId: "bad" } }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
    });
    const text = await response.text();
    expect(text).not.toContain("/Users/secret");
    expect(text).toContain("UPSTREAM_UNAVAILABLE");
  });

  it("refuses the published placeholder secret in production", async () => {
    let called = false;
    const response = await handleGateway(postChat(chatBody()), gatewayEnv({
      GATEWAY_ENV: "production",
      AGENT_HUB_ORIGIN: "https://agent.ittdigitalhub.org",
      AGENT_HUB_SHARED_SECRET: DEV_PLACEHOLDER_SECRET,
    }), {
      log: () => undefined,
      fetch: () => {
        called = true;
        return Promise.reject(new Error("must not call"));
      },
    });
    expect(called).toBe(false);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain(DEV_PLACEHOLDER_SECRET);
  });

  it("passes an event stream through without buffering a custom protocol", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: hi\n\n"));
        controller.close();
      },
    });
    const response = await handleGateway(postChat(chatBody()), gatewayEnv(), {
      log: () => undefined,
      fetch: async () => new Response(stream, { status: 200, headers: { "content-type": "text/event-stream" } }),
    });
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(await response.text()).toBe("data: hi\n\n");
  });

  it("does not contain model provider calls", () => {
    const source = [
      readFileSync("platform/gateway/src/handler.ts", "utf8"),
      readFileSync("platform/gateway/src/index.ts", "utf8"),
    ].join("\n");
    expect(source).not.toMatch(/generativelanguage|api\.openai\.com|GEMINI_API_KEY|OPENAI_API_KEY|supabase|RESEND_API_KEY/);
  });

  it("signs and proxies an agent action without interpreting its input", async () => {
    const raw = JSON.stringify({
      locale: "bg",
      input: { workEmail: "goal2-test@example.com", marketingConsent: false },
    });
    let captured: { url: string; body: string; headers: Headers } | undefined;
    const response = await handleGateway(
      new Request("https://api.ittdigitalhub.org/v1/agents/ai-act/actions/lead", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://ittdigitalhub.org" },
        body: raw,
      }),
      gatewayEnv(),
      {
        now: () => 1_700_000_000_000,
        log: () => undefined,
        fetch: async (input, init) => {
          const request = new Request(input, init);
          captured = { url: request.url, body: await request.text(), headers: request.headers };
          return new Response(
            JSON.stringify({
              error: {
                code: "LEAD_REQUIRED",
                message: "A few details are required before continuing.",
                requestId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
              },
            }),
            { status: 403, headers: { "content-type": "application/json" } },
          );
        },
      },
    );
    expect(captured?.url).toBe("http://127.0.0.1:9/v1/agents/ai-act/actions/lead");
    expect(captured?.body).toBe(raw);
    const verdict = await verifySignature({
      secret: SECRET,
      timestamp: captured?.headers.get("x-itt-timestamp") ?? "",
      method: "POST",
      path: "/v1/agents/ai-act/actions/lead",
      requestId: captured?.headers.get("x-itt-request-id") ?? "",
      body: new TextEncoder().encode(captured?.body ?? ""),
      signature: captured?.headers.get("x-itt-signature") ?? "",
      nowSeconds: 1_700_000_000,
    });
    expect(verdict).toBe("ok");
    expect(response.status).toBe(403);
    expect((await readError(response)).error.code).toBe("LEAD_REQUIRED");
    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
  });
});
