# ITT Digital Hub

Bilingual (BG/EN) website of ITT Digital Hub — Applied AI Consultancy. Prepared as a digital business card for AI Industrial Summit 2026.

This repository is independent of the CIT website. Do not push here to `vankottt/cit-website`.

## Run

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (`/` negotiates locale; default `bg`).

```sh
npm run check   # typecheck, lint, tests, production build
```

Copy `.env.example` to `.env.local`. Do not commit secrets.

Preview/staging remain `noindex,nofollow` unless `ITT_ALLOW_INDEXING=true` on an explicit production deployment.

## Content

Public copy lives in `src/content/`. Unverified facts use `TODO_CONTENT`, `TODO_VERIFY`, `TODO_ASSET`, or `TODO_PERMISSION`. Do not invent clients, metrics, or permissions.

## Docs

- `AGENTS.md` — product rules
- `docs/ITT_TRANSFORMATION_MAP.md` — what was reused from CIT
