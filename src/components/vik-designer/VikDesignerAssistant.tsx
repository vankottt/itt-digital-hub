"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { vikDesigner as copy } from "@/content/vik-designer";
import { mapPlatformError, postAgent } from "@/lib/agent-platform/client";
import { VIK_CHAT_PATH, VIK_HISTORY_LIMIT, VIK_SESSION_STORAGE_KEY } from "@/lib/vik-designer/client";
import { AnswerBody } from "@/components/vik-designer/AnswerBody";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/Icons";

type Turn = { id: string; role: "user" | "assistant"; content: string; status: "complete" | "pending" | "error"; errorCode?: string };

const listeners = new Set<() => void>();
const EMPTY_SESSION = JSON.stringify({ sessionId: "", messages: [] as Turn[] });
let live = EMPTY_SESSION;

function emitSession(): void {
  listeners.forEach((listener) => listener());
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`;
}

function readSession(): string {
  if (live !== EMPTY_SESSION) return live;
  const stored = sessionStorage.getItem(VIK_SESSION_STORAGE_KEY);
  live = stored ?? JSON.stringify({ sessionId: newId(), messages: [] });
  if (!stored) sessionStorage.setItem(VIK_SESSION_STORAGE_KEY, live);
  return live;
}

function commitSession(sessionId: string, messages: Turn[]): void {
  live = JSON.stringify({ sessionId, messages });
  sessionStorage.setItem(
    VIK_SESSION_STORAGE_KEY,
    JSON.stringify({ sessionId, messages: messages.filter((turn) => turn.status === "complete") }),
  );
  emitSession();
}

function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseSession(raw: string): { sessionId: string; messages: Turn[] } {
  try {
    const parsed = JSON.parse(raw) as { sessionId?: string; messages?: Turn[] };
    return { sessionId: parsed.sessionId || "", messages: Array.isArray(parsed.messages) ? parsed.messages : [] };
  } catch {
    return { sessionId: "", messages: [] };
  }
}

function errorCopy(locale: Locale, code?: string): string {
  const table = copy.errors;
  if (code === "rate_limited") return table.rate_limited[locale];
  if (code === "timeout") return table.timeout[locale];
  if (code === "provider_error" || code === "not_configured") return table.provider_error[locale];
  if (code === "network") return table.network[locale];
  if (code === "invalid") return table.invalid[locale];
  return table.generic[locale];
}

export function VikDesignerAssistant({ locale }: { locale: Locale }) {
  const raw = useSyncExternalStore(subscribeSession, readSession, () => EMPTY_SESSION);
  const { sessionId, messages } = parseSession(raw);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const pending = messages.some((turn) => turn.status === "pending");

  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending || !sessionId) return;
    const userTurn: Turn = { id: newId(), role: "user", content, status: "complete" };
    const pendingTurn: Turn = { id: newId(), role: "assistant", content: "", status: "pending" };
    const complete = messages.filter((turn) => turn.status === "complete");
    const history = [...complete, userTurn].slice(-VIK_HISTORY_LIMIT);
    commitSession(sessionId, [...complete, userTurn, pendingTurn]);
    setDraft("");
    try {
      const response = await postAgent(VIK_CHAT_PATH, {
        sessionId,
        locale,
        message: content,
        history: history.slice(0, -1).map((turn) => ({ role: turn.role, content: turn.content })),
      });
      const data = (await response.json()) as { answer?: string; error?: { code?: string } };
      const errorCode = response.ok ? undefined : mapPlatformError(data.error?.code);
      const current = parseSession(readSession()).messages;
      commitSession(
        sessionId,
        current.map((turn) => {
          if (turn.id !== pendingTurn.id) return turn;
          if (response.ok && data.answer) return { ...turn, status: "complete" as const, content: data.answer };
          return { ...turn, status: "error" as const, errorCode: errorCode ?? "provider_error", content: "" };
        }),
      );
      if (!response.ok || !data.answer) setDraft(content);
    } catch {
      setDraft(content);
      const current = parseSession(readSession()).messages;
      commitSession(
        sessionId,
        current.map((turn) => (turn.id === pendingTurn.id ? { ...turn, status: "error" as const, errorCode: "network", content: "" } : turn)),
      );
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper pt-24 md:pt-28">
      <div className="border-b border-line">
        <Container className="py-4 md:py-5">
          <Link href={href(locale, "tools")} className="group inline-flex items-center gap-2 font-sans text-small font-medium text-ink hover:text-marine">
            <ArrowRight className="shrink-0 rotate-180" />
            <span className="underline decoration-line-strong underline-offset-[4px] group-hover:decoration-amber">{copy.back[locale]}</span>
          </Link>
          <h1 className="mt-3 text-h3 text-pretty text-ink">{copy.title[locale]}</h1>
          <p className="mt-1 text-small text-ink-2">{copy.subtitle[locale]}</p>
        </Container>
      </div>
      <Container className="flex min-h-0 flex-1 flex-col pb-0">
        <div ref={logRef} className="min-h-[14rem] flex-1 overflow-y-auto py-6 md:py-8" aria-live="polite">
          <div className="mx-auto w-full max-w-[42rem]">
            {messages.length === 0 ? (
              <div>
                <p className="max-w-[54ch] text-small text-ink-2">{copy.intro[locale]}</p>
                <p className="mt-8 label">{copy.startersLabel[locale]}</p>
                <ul className="mt-3 grid gap-2">
                  {copy.starters.map((item) => (
                    <li key={item.en}>
                      <button
                        type="button"
                        onClick={() => void send(item[locale])}
                        disabled={pending}
                        className="w-full rounded-[1.25rem] border border-line bg-white px-4 py-3 text-left text-small text-ink transition-colors duration-150 hover:border-signal hover:bg-marine-tint disabled:opacity-60"
                      >
                        {item[locale]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ol className="grid gap-6">
                {messages.map((turn) =>
                  turn.role === "user" ? (
                    <li key={turn.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-[1.25rem] bg-marine px-4 py-3 text-on-dark">
                        <p className="label-dark">{copy.you[locale]}</p>
                        <p className="mt-1 whitespace-pre-wrap text-small text-on-dark">{turn.content}</p>
                      </div>
                    </li>
                  ) : (
                    <li key={turn.id}>
                      <div className="rounded-[1.25rem] border border-line bg-white px-4 py-4 shadow-[inset_3px_0_0_0_var(--color-signal)] md:px-5">
                        <p className="label text-signal">{copy.assistant[locale]}</p>
                        {turn.status === "pending" ? (
                          <p className="mt-2 text-small text-ink-3" role="status">
                            {copy.generating[locale]}
                          </p>
                        ) : turn.status === "error" ? (
                          <div className="mt-2">
                            <p className="text-small text-ink-2">{errorCopy(locale, turn.errorCode)}</p>
                            <button type="button" className="mt-3 text-small font-medium text-signal underline-offset-[4px] hover:underline" onClick={() => void send(draft || contentOfLastUser(messages))}>
                              {copy.retry[locale]}
                            </button>
                          </div>
                        ) : (
                          <AnswerBody markdown={turn.content} sourceLabel={copy.source[locale]} />
                        )}
                      </div>
                    </li>
                  ),
                )}
              </ol>
            )}
          </div>
        </div>
        <form
          className="sticky bottom-0 z-10 border-t border-line bg-paper pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void send(draft);
          }}
        >
          <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-3 sm:flex-row sm:items-end">
            <label htmlFor={inputId} className="sr-only">
              {copy.placeholder[locale]}
            </label>
            <textarea
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
              rows={2}
              maxLength={4000}
              disabled={pending}
              placeholder={copy.placeholder[locale]}
              className="min-w-0 flex-1 resize-none rounded-[1.25rem] bg-white px-4 py-3 font-sans text-base leading-normal text-ink outline-none placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:text-small"
            />
            <Button type="submit" disabled={pending || draft.trim().length === 0} className="w-full min-h-11 shrink-0 sm:w-auto">
              {pending ? copy.sending[locale] : copy.send[locale]}
            </Button>
          </div>
          <p className="mx-auto mt-3 max-w-[42rem] pb-4 text-[0.75rem] leading-5 text-ink-3">{copy.notice[locale]}</p>
        </form>
      </Container>
    </div>
  );
}

function contentOfLastUser(messages: Turn[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const turn = messages[index];
    if (turn?.role === "user") return turn.content;
  }
  return "";
}
