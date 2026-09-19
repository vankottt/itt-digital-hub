# AI Act agent — Goal 2 status

Goal 2 connects the live model, knowledge corpus, persistence and kit ZIP. Goal 1 UI, journeys and branding stay in place.

## Routes

| Path | Role |
| --- | --- |
| `/bg/ai-act-agent`, `/en/ai-act-agent` | Entry / two journeys |
| `/bg/ai-act-agent/use`, `/en/ai-act-agent/use` | Hosted assistant |
| `/bg/ai-act-agent/build`, `/en/ai-act-agent/build` | Build Your Own |

## Runtime

```
Chat UI → POST /api/ai-act/chat → completeAiActChat() → AiProvider.complete()
```

- Config: `AI_PROVIDER`, `AI_MODEL`, `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY` (server-only)
- Default provider `google`, default model `gemini-3.8-flash`
- Knowledge: `src/content/ai-act-kit/` loaded through `knowledge.ts` as system context
- Gate: httpOnly signed cookie `itt_ai_act_gate` (two anonymous completions, then lead)
- Leads: `public.ai_act_leads` when Supabase is configured, otherwise `.data/ai-act/leads.json`
- Kit: `GET /api/ai-act/kit` returns a real ZIP after lead capture

## Agent Kit

`README.md`, `INSTALLER_PROMPT.md`, `SYSTEM_PROMPT.md`, `AGENT_CONFIG.md`, `TEST_CASES.md`, `VERSION.md`, `sources/` with official EUR-Lex and Commission extracts.
