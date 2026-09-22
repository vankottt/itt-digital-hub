import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { Agent, AgentManifest } from "../../platform/agent-hub/src/agent";
import { knowledgeDirectory, listLocalKnowledge, readKnowledgeFile } from "../../platform/agent-hub/src/knowledge";
import { createAgentRegistry } from "../../platform/agent-hub/src/registry";
import { handleHubRequest } from "../../platform/agent-hub/src/server";
import { readHubEnv } from "../../platform/agent-hub/src/env";
import { DEV_PLACEHOLDER_SECRET } from "../../platform/shared/src/index";
import { chatBody, readError, readSuccess, runtimeWith, SECRET, signedHubRequest } from "./helpers";

const NOW = new Date("2026-01-01T00:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

function manifest(overrides: Partial<AgentManifest> = {}): AgentManifest {
  return {
    id: "custom",
    name: "Custom",
    version: "0.1.0",
    enabled: true,
    locales: ["bg", "en"],
    visibility: "public",
    tools: [],
    logging: { conversation: "none" },
    ...overrides,
  };
}

describe("agent hub", () => {
  it("returns a public health payload", async () => {
    const response = await handleHubRequest(new Request("http://127.0.0.1/health"), runtimeWith([]));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", service: "itt-agent-hub" });
  });

  it("accepts a valid HMAC and dispatches the mock agent", async () => {
    const lines: string[] = [];
    const response = await handleHubRequest(
      await signedHubRequest({ rawBody: chatBody("ping"), timestamp: NOW_SECONDS }),
      runtimeWith(lines, { now: () => NOW }),
    );
    expect(response.status).toBe(200);
    const body = await readSuccess(response);
    expect(body.agentId).toBe("mock");
    expect(body.answer).toBe("mock:ping");
    expect(body.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.answer).not.toContain("LOCAL_KNOWLEDGE_MARKER");
    const logged = lines.join("\n");
    expect(logged).toContain("\"requestId\"");
    expect(logged).toContain("\"agentId\":\"mock\"");
    expect(logged).toContain("\"status\":200");
    expect(logged).not.toContain(SECRET);
    expect(logged).not.toContain("ping");
  });

  it("rejects an invalid signature", async () => {
    const request = await signedHubRequest({ timestamp: NOW_SECONDS, signature: "a".repeat(64) });
    const response = await handleHubRequest(request, runtimeWith([], { now: () => NOW }));
    expect(response.status).toBe(401);
    expect((await readError(response)).error.code).toBe("INVALID_SIGNATURE");
  });

  it("rejects an expired signature and prefers invalid over expired", async () => {
    const expired = await handleHubRequest(
      await signedHubRequest({ timestamp: NOW_SECONDS - 301 }),
      runtimeWith([], { now: () => NOW }),
    );
    expect((await readError(expired)).error.code).toBe("SIGNATURE_EXPIRED");

    const signed = await signedHubRequest({ timestamp: NOW_SECONDS - 301 });
    const signature = signed.headers.get("x-itt-signature") ?? "";
    const flipped = `${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;
    signed.headers.set("x-itt-signature", flipped);
    const invalid = await handleHubRequest(new Request(signed, { body: chatBody() }), runtimeWith([], { now: () => NOW }));
    expect((await readError(invalid)).error.code).toBe("INVALID_SIGNATURE");
  });

  it("returns not found for an unknown agent and disabled for the example", async () => {
    const missing = await handleHubRequest(
      await signedHubRequest({ agentId: "missing", timestamp: NOW_SECONDS }),
      runtimeWith([], { now: () => NOW }),
    );
    expect((await readError(missing)).error.code).toBe("AGENT_NOT_FOUND");

    const example = await handleHubRequest(
      await signedHubRequest({ agentId: "example", timestamp: NOW_SECONDS }),
      runtimeWith([], { now: () => NOW }),
    );
    expect(example.status).toBe(403);
    expect((await readError(example)).error.code).toBe("AGENT_DISABLED");
  });

  it("hides thrown agent errors and internal agents", async () => {
    const lines: string[] = [];
    const boom: Agent = {
      manifest: manifest({ id: "boom" }),
      async handle() {
        throw new Error("boom /Users/ivan/secret-key");
      },
    };
    const hidden: Agent = {
      manifest: manifest({ id: "hidden", visibility: "internal" }),
      async handle() {
        return { answer: "secret-answer" };
      },
    };
    const runtime = runtimeWith(lines, { now: () => NOW, registry: createAgentRegistry([boom, hidden]) });
    const failed = await handleHubRequest(await signedHubRequest({ agentId: "boom", timestamp: NOW_SECONDS }), runtime);
    const text = await failed.text();
    expect(failed.status).toBe(500);
    expect(text).toContain("INTERNAL");
    expect(text).not.toContain("/Users/ivan");
    expect(lines.join("\n")).not.toContain("/Users/ivan");

    const concealed = await handleHubRequest(
      await signedHubRequest({ agentId: "hidden", timestamp: NOW_SECONDS }),
      runtime,
    );
    expect((await readError(concealed)).error.code).toBe("AGENT_NOT_FOUND");
  });

  it("does not expose MCP or tool routes", async () => {
    for (const path of ["/mcp", "/tools/list", "/resources/list", "/prompts/list"]) {
      const response = await handleHubRequest(new Request(`http://127.0.0.1${path}`), runtimeWith([]));
      expect(response.status).toBe(404);
    }
  });

  it("reads local knowledge without leaving the agent directory", async () => {
    const directory = knowledgeDirectory("mock", "knowledge");
    expect(await listLocalKnowledge(directory)).toContain("notes.txt");
    expect(await readKnowledgeFile(directory, "notes.txt")).toContain("LOCAL_KNOWLEDGE_MARKER");
    await expect(readKnowledgeFile(directory, "../manifest.json")).rejects.toThrow("Invalid knowledge file");
  });

  it("refuses the placeholder secret when NODE_ENV is production", () => {
    const result = readHubEnv({
      ITT_HUB_SHARED_SECRET: DEV_PLACEHOLDER_SECRET,
      NODE_ENV: "production",
    });
    expect(result).toEqual({ error: "Refusing placeholder ITT_HUB_SHARED_SECRET when NODE_ENV is production" });
    expect(JSON.stringify(result)).not.toContain("stack");
  });

  it("keeps a supplied session id", async () => {
    const sessionId = randomUUID();
    const response = await handleHubRequest(
      await signedHubRequest({
        timestamp: NOW_SECONDS,
        rawBody: chatBody("hello", { sessionId }),
      }),
      runtimeWith([], { now: () => NOW }),
    );
    expect((await readSuccess(response)).sessionId).toBe(sessionId);
  });
});
