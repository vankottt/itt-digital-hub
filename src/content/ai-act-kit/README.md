# ITT Digital Hub - AI Act Agent Kit

This package is a practically reusable AI agent package. It is not a chatbot prompt on its own.

It helps you create a specialised AI Act assistant that:

- explains in practical language;
- uses a fixed set of official sources;
- distinguishes a legal duty from a good practice and from a recommendation;
- asks for missing context instead of inventing requirements.

The package is published by ITT Digital Hub as a practical resource. It is not legal advice and does not create a lawyer–client relationship.

## What you will create

A specialised AI Act assistant that you can run in your own ChatGPT account (or another chat tool that can read these files). The hosted assistant on the ITT Digital Hub website uses the same behaviour instructions and the same sources.

Typical users are small design and engineering teams, often in building services / HVAC / water. The assistant can also work for other organisations when you give it enough context.

## Where to start

1. Read this file.
2. Open `INSTALLER_PROMPT.md`. That is the text you give to ChatGPT together with the files.
3. Give ChatGPT the whole package: this folder, including `sources/`.
4. Let `SYSTEM_PROMPT.md` and `AGENT_CONFIG.md` define behaviour. Do not ask ChatGPT to invent a new architecture.
5. After setup, run the cases in `TEST_CASES.md`. Do not look for a memorised answer. Watch whether the assistant behaves as it should.

## Files

| File | Role |
| --- | --- |
| `README.md` | What this package is and how to start. |
| `INSTALLER_PROMPT.md` | Text to give ChatGPT with the files. |
| `SYSTEM_PROMPT.md` | Full behaviour instructions. |
| `AGENT_CONFIG.md` | Purpose, audience, scope, limits, source policy. |
| `TEST_CASES.md` | Behavioural checks after setup. |
| `VERSION.md` | Kit and knowledge version. |
| `sources/` | Official source pack the assistant must rely on. |

## What this is not

- Not a substitute for a lawyer, DPO, or notified body.
- Not a complete copy of the Official Journal.
- Not tied to one ChatGPT screen, project type, or menu that may change.
- Not an account, dashboard, or hosted product inside your organisation.

If you want the same approach applied to your own processes, discuss it with ITT Digital Hub.
