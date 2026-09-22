# ITT Digital Hub

Bilingual (BG/EN) website of ITT Digital Hub — Applied AI Consultancy. Prepared as a digital business card for AI Industrial Summit 2026.

This repository is one site: consultancy pages plus product surfaces (AI Act Assistant, Settlement Analyzer, and later tools) on the same Next.js app and Vercel project. Not separate products or deploys.

This repository is independent of the CIT website. Do not push here to `vankottt/cit-website`.

## Run

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (`/` is Bulgarian; English is `/en`).

```sh
npm run check   # typecheck, lint, tests, production build
```

Copy `.env.example` to `.env.local`. Do not commit secrets.

## Agent platform

The public site stays on Vercel. Agent calls go through the Cloudflare Worker at `api.ittdigitalhub.org` to the local Agent Hub. Setup, tunnel, and deploy steps are in `docs/agent-platform-runbook.md`.

```sh
cp platform/agent-hub/.env.example platform/agent-hub/.env
cp platform/gateway/.dev.vars.example platform/gateway/.dev.vars
npm run agent-hub:dev
npm run agent-hub:start
npm run agent-gateway:dev
npm run agent-platform:test
```

Replace the placeholder shared secret in both files before exposing the tunnel. `openssl rand -hex 32` prints one.

Preview/staging remain `noindex,nofollow` unless `ITT_ALLOW_INDEXING=true` on an explicit production deployment.

## Content

Public copy lives in `src/content/`. Unverified facts use `TODO_CONTENT`, `TODO_VERIFY`, `TODO_ASSET`, or `TODO_PERMISSION`. Do not invent clients, metrics, or permissions.

## Docs

- `AGENTS.md` — product rules
- `docs/ITT_TRANSFORMATION_MAP.md` — what was reused from CIT
