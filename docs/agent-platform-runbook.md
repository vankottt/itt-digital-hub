# ITT Agent Platform runbook

Commands are run from the repository root. The site commands `npm run dev`, `npm run build`, `npm run test`, `npm run lint`, and `npm run check` are unchanged in purpose. `npm run check` also typechecks the Worker.

Do not point `ittdigitalhub.org` away from Vercel. Do not create `api.ittdigitalhub.org` or `agent.ittdigitalhub.org` until the steps below.

## One-time local setup

```sh
npm install
cp platform/agent-hub/.env.example platform/agent-hub/.env
cp platform/gateway/.dev.vars.example platform/gateway/.dev.vars
openssl rand -hex 32
```

Put that same value in `ITT_HUB_SHARED_SECRET` and `AGENT_HUB_SHARED_SECRET`. The placeholder in the examples works only for local development. Production refuses it.

## Start the Agent Hub

```sh
npm run agent-hub:dev
```

For the tunnel, use the same process without watch mode and with production secret checks:

```sh
npm run agent-hub:start
```

Both run `tsx platform/agent-hub/src/main.ts`. The process loads `platform/agent-hub/.env`, then fills any still-unset keys from `.env.local`. It does not override variables already set in the shell. It binds `127.0.0.1:8788`. `agent-hub:start` sets `NODE_ENV=production` before that load, so a placeholder shared secret is refused.

```sh
curl -sS http://127.0.0.1:8788/health
```

Expected body: `{"status":"ok","service":"itt-agent-hub"}`.

## Start the Worker locally

In a second terminal:

```sh
npm run agent-gateway:dev
```

This runs Wrangler on port 8787 and points `AGENT_HUB_ORIGIN` at `http://127.0.0.1:8788` with `GATEWAY_ENV=development`. The shared secret comes from `platform/gateway/.dev.vars`.

```sh
curl -sS http://127.0.0.1:8787/v1/health
```

Expected body: `{"status":"ok","service":"itt-agent-gateway"}`.

## Tests

```sh
npm run agent-platform:test
npm run check
```

The platform tests use the mock agent and mocked providers. They do not call Gemini, OpenRouter, or OpenAI. `npm run ai-act:eval` is a separate live comparison and is not part of `npm run check`.

## Local smoke test

With both processes running:

```sh
curl -sS -X POST http://127.0.0.1:8787/v1/agents/mock/chat \
  -H 'content-type: application/json' \
  -H 'origin: http://localhost:3000' \
  -d '{"locale":"en","message":"hello"}'
```

Expected answer: `mock:hello`.

## Deploy the Worker

Deploy does not attach a hostname until the route below is uncommented. `workers.dev` is disabled. `wrangler deploy` also fails until `AGENT_HUB_SHARED_SECRET` exists on the Worker, which avoids publishing a gateway that cannot authenticate.

1. Confirm `api.ittdigitalhub.org` has no DNS record yet. A custom domain cannot replace an existing CNAME. Leave `ittdigitalhub.org` on Vercel.
2. In `platform/gateway/wrangler.jsonc`, uncomment:

```jsonc
"routes": [{ "pattern": "api.ittdigitalhub.org", "custom_domain": true }]
```

3. Store the same secret the hub uses. Wrangler prompts for the value:

```sh
npx wrangler secret put AGENT_HUB_SHARED_SECRET --config platform/gateway/wrangler.jsonc
```

4. Confirm the account with `npx wrangler whoami`, then:

```sh
npm run agent-gateway:deploy
```

That is `wrangler deploy --config platform/gateway/wrangler.jsonc`. Cloudflare creates the `api` DNS record and certificate. It does not change the website hostname.

5. Check:

```sh
curl -sS https://api.ittdigitalhub.org/v1/health
```

Chat stays unavailable until the tunnel is up. The health check does not call the hub.

Regenerate Worker types after a config change:

```sh
npm run agent-gateway:types
```

## Create the tunnel

Install `cloudflared` (`brew install cloudflared` on this machine). Log in once:

```sh
cloudflared tunnel login
cloudflared tunnel create itt-agent-hub
```

The create command writes a credentials JSON under `~/.cloudflared/`. Leave it there. Do not copy it into the repo.

Create the hostname. This adds one DNS record for `agent.ittdigitalhub.org` only:

```sh
cloudflared tunnel route dns itt-agent-hub agent.ittdigitalhub.org
```

Copy the example and replace `<TUNNEL_ID>` with the UUID from `cloudflared tunnel list`:

```sh
cp platform/tunnel/config.yml.example platform/tunnel/config.yml
cloudflared tunnel --config platform/tunnel/config.yml run
```

The ingress rule sends `agent.ittdigitalhub.org` to `http://127.0.0.1:8788`. One tunnel serves every agent.

Keep the hub running on that port. A direct browser call to `https://agent.ittdigitalhub.org/v1/agents/mock/chat` must fail with `INVALID_SIGNATURE`. `/health` returns only the service name.

## Production smoke test

After the Worker route and the tunnel are both up:

```sh
curl -sS -X POST https://api.ittdigitalhub.org/v1/agents/mock/chat \
  -H 'content-type: application/json' \
  -H 'origin: https://ittdigitalhub.org' \
  -d '{"locale":"bg","message":"hello"}'
```

## Add an agent skeleton

1. Create `platform/agent-hub/agents/<id>/` with `manifest.json`, `handler.ts`, `prompts/`, and `knowledge/`.
2. Use an id of lowercase letters, numbers, and hyphens. Set `enabled` and `visibility`.
3. Export an `Agent` whose `handle` receives `AgentRequest` and `AgentContext`.
4. Register that export in `platform/agent-hub/src/registry.ts`.
5. Call a provider only through `context.models.complete` and name the provider explicitly. Do not add a network call to the gateway.
6. Run `npm run agent-platform:test`.

`mock` and `example` are the reference skeletons. `example` is disabled so dispatch must not call it.
