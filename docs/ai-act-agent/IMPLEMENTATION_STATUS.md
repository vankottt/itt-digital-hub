# AI Act agent — Goal 1 status

Goal 1 is the frontend product and integration boundary. Goal 2 connects the live model, knowledge corpus, persistence and kit ZIP.

## Routes

| Path | Role |
| --- | --- |
| `/bg/ai-act-agent`, `/en/ai-act-agent` | Entry / two journeys |
| `/bg/ai-act-agent/use`, `/en/ai-act-agent/use` | Hosted assistant |
| `/bg/ai-act-agent/build`, `/en/ai-act-agent/build` | Build Your Own |

Bulgarian is the conference primary. English is a full parallel. Not in primary nav. In sitemap.

Campaign: `?src=conference` (also `utm_source`, `campaign`, `utm_campaign`).

## Key files

- Copy: `src/content/ai-act-agent.ts`
- Installer prompt (single UI source): `src/content/ai-act-kit/installer-prompt.ts` via `getInstallerPrompt()` in `src/lib/ai-act/kit.ts`
- Pages: `src/app/[locale]/ai-act-agent/**`
- UI: `src/components/ai-act-agent/`
- Session store (client `sessionStorage` only): `src/lib/ai-act/session-store.ts`, types in `src/lib/ai-act/types.ts`
- Lead validation: `src/lib/ai-act/lead.ts`
- Chat request validation: `src/lib/ai-act/chat-request.ts`
- Analytics wrapper: `src/lib/ai-act/analytics.ts` (`@vercel/analytics` `track`)

## Lead / session model

`AiActSession` in `src/lib/ai-act/types.ts`. One profile for chat and kit download. Client `sessionStorage` key `itt-ai-act-session-v1`. After two anonymous questions, chat shows `LeadCapture`. Kit download reuses the same component and skips it when `leadCaptured` is true.

`POST /api/ai-act/lead` validates and returns `{ ok: true, persisted: false }`. No database.

## AI provider boundary

```
Chat UI → POST /api/ai-act/chat → completeAiActChat() → AiProvider.complete()
```

- Config: `src/lib/ai-act/config.ts` (`AI_PROVIDER`, `AI_MODEL`, `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY`)
- Default provider `google`, default model `gemini-3.8-flash`
- Providers: `src/lib/ai-act/providers/google.ts`, `openai.ts`
- Knowledge (empty, provider-agnostic): `src/lib/ai-act/knowledge.ts`
- Goal 1 `complete()` returns `not_configured` / `not_implemented`. UI shows error + retry. No fabricated answers.

Keys stay server-side. Frontend copy does not name Gemini or OpenAI.

## Agent Kit

Structure in `AGENT_KIT_FILES`. `GET /api/ai-act/kit` returns 503 `kit_not_ready`. Download button and blob handling are ready for a real ZIP.

## Analytics events

`ai_act_page_view`, `ai_act_path_selected`, `ai_act_question_started`, `ai_act_lead_gate_viewed`, `ai_act_lead_submitted`, `ai_act_build_step_viewed`, `ai_act_kit_download_clicked`, `ai_act_installer_prompt_copied`, `ai_act_test_copied`, `ai_act_contact_clicked`.

## Goal 2

1. Implement Google `complete()` (Gemini Developer API, `gemini-3.8-flash`) and the same contract for OpenAI.
2. Load real `SYSTEM_PROMPT.md` and the AI Act corpus through `knowledge.ts` without vendor retrieval in the UI.
3. Persist leads/sessions; enforce the two-question gate server-side.
4. Replace installer prompt with real `INSTALLER_PROMPT.md`; stream the ZIP from `/api/ai-act/kit`.
5. Do not invent legal answers in the assistant.
