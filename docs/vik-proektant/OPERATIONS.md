# Operations

## What is deployed

V2 is implemented in this repository and is not deployed by this change. The Cloudflare gateway at `api.ittdigitalhub.org` was not modified. DNS was not modified. Production secrets were not modified.

When the website is deployed through the existing Vercel project, these routes go with it:

- `https://ittdigitalhub.org/bg/vik-proektant`
- `https://ittdigitalhub.org/en/vik-proektant`
- `https://ittdigitalhub.org/bg/vik-proektant/compare`
- `https://ittdigitalhub.org/en/vik-proektant/compare`
- `POST https://ittdigitalhub.org/api/mcp/vik`
- `GET https://ittdigitalhub.org/api/mcp/vik/health`
- `POST https://ittdigitalhub.org/api/vik-proektant/compare`
- `GET https://ittdigitalhub.org/api/vik-proektant/health`

## Environment

Set these on the server only. None of them use a `NEXT_PUBLIC_` name.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Responses API for the comparison. Already used as a server key. |
| `VIK_COMPARISON_MODEL` | Single model id. Default `gpt-5.6`. |
| `VIK_MCP_PUBLIC_URL` | Optional override of the MCP URL given to OpenAI. Default is the site origin plus `/api/mcp/vik`. |
| `VIK_CHATGPT_DESTINATION_URL` | HTTPS link for the product-page button. Empty until publication. |
| `VIK_MCP_PORT` | Local `npm run vik-mcp` port. Default `8789`. |

## Local MCP

`npm run vik-mcp` listens on `127.0.0.1:8789`. `GET /health` returns document and tool counts. `POST /` speaks MCP JSON-RPC.

The interactive MCP Inspector UI was not run here. `tests/vik-proektant/mcp.test.ts` performs the same initialize, list, and call flow.

## Health

`GET /api/mcp/vik/health` reports corpus size and tool names. `GET /api/vik-proektant/health` reports whether a model id and an OpenAI key are configured. It does not return the key or the prompt.

## Logs

Comparison logs are one JSON line per request: request id, model id, control/expert latency, success or a normalized error, tool names, retrieval count, prompt hash, deployment sha. Prompt text is not logged.

## Limits and security

- Comparison prompts are trimmed and capped at 4,000 characters, 8 requests per 10 minutes per hashed client address.
- MCP calls are capped at 600 per minute per hashed address, with a 256 KB body limit.
- Tool arguments reject unknown fields. Reference ids must match `vk1_...` and are not file paths.
- Search returns at most 8 short excerpts. `list_vik_sources` returns metadata only.
- Errors shown in the comparison UI are codes, not upstream bodies.
- The plugin package contains no API key.
- The comparison response does not include the skill text, the control instruction, or raw tool payloads.
- No login is required for the public demonstration. The tools do not write data.

## Rollback

V2 is additive. To remove it from a deployment, revert the V2 commits. V1 does not import V2 modules. Leaving the new routes in place does not change `/vik-designer` or `/v1/agents/vik-designer/chat`.

## Common failures

| Symptom | Cause |
| --- | --- |
| Both columns say the comparison is not enabled | `OPENAI_API_KEY` is missing |
| Expert fails and Control answers | OpenAI cannot reach the MCP URL. Set `VIK_MCP_PUBLIC_URL` to a public HTTPS URL |
| `model_mismatch` | The service returned a different model id. The answer is hidden |
| ChatGPT cannot see tools | The site is not deployed, or the MCP URL was not registered in developer mode |
| Open in ChatGPT stays inactive | `VIK_CHATGPT_DESTINATION_URL` is empty |
