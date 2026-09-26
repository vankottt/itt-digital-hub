import { createServer } from "node:http";
import { mcpHealth, handleMcpHttp } from "./mcp/http";

const port = Number(process.env.VIK_MCP_PORT ?? 8789);
const host = "127.0.0.1";

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? "/", `http://${host}`);
    if (url.pathname === "/health") {
      const body = JSON.stringify(mcpHealth());
      res.writeHead(200, { "content-type": "application/json" });
      res.end(body);
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }
    const request = new Request(`http://${host}${url.pathname}`, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
    });
    const response = await handleMcpHttp(request);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    res.writeHead(response.status, responseHeaders);
    res.end(Buffer.from(await response.arrayBuffer()));
  })().catch(() => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "internal" }));
  });
});

server.listen(port, host, () => {
  console.info(JSON.stringify({ ...mcpHealth(), listen: { host, port } }));
});
