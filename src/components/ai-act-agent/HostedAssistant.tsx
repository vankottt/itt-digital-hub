"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { aiActAgent as copy } from "@/content/ai-act-agent";
import { trackAiActEvent } from "@/lib/ai-act/analytics";
import {
  AI_ACT_MESSAGE_MAX_LENGTH,
  ANONYMOUS_QUESTION_LIMIT,
  type AiActChatResponse,
  type AiActErrorCode,
  type ChatTurn,
} from "@/lib/ai-act/types";
import { needsLeadGate, remainingAnonymousQuestions, recordEvent } from "@/lib/ai-act/session";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/ButtonLink";
import { ProductChrome } from "./ProductChrome";
import { LeadCapture } from "./LeadCapture";
import { useAiActSession } from "./AiActSessionProvider";

function errorCopy(locale: Locale, code?: AiActErrorCode): string {
  if (!code) return copy.chat.errors.generic[locale];
  const table = copy.chat.errors;
  if (code === "not_configured") return table.not_configured[locale];
  if (code === "not_implemented") return table.not_implemented[locale];
  if (code === "rate_limited") return table.rate_limited[locale];
  if (code === "provider_error") return table.provider_error[locale];
  if (code === "timeout") return table.timeout[locale];
  if (code === "network") return table.network[locale];
  if (code === "invalid") return table.invalid[locale];
  if (code === "lead_required") return table.lead_required[locale];
  if (code === "kit_not_ready") return table.kit_not_ready[locale];
  return table.generic[locale];
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function HostedAssistant({ locale }: { locale: Locale }) {
  const { session, update, ensure } = useAiActSession();
  const [draft, setDraft] = useState("");
  const [gateThanks, setGateThanks] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const gate = needsLeadGate(session);
  const remaining = remainingAnonymousQuestions(session);
  const pending = session.messages.some((turn) => turn.status === "pending");

  useEffect(() => {
    update((current) => ({ ...current, journey: current.journey ?? "use", locale }));
    trackAiActEvent("ai_act_page_view", { locale, surface: "use" });
    trackAiActEvent("ai_act_path_selected", { locale, path: "use" });
  }, [locale, update]);

  useEffect(() => {
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [session.messages]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () => {
      const obscured = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--ai-act-keyboard", `${obscured}px`);
    };
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      document.documentElement.style.removeProperty("--ai-act-keyboard");
    };
  }, []);

  async function send(text: string, options?: { retryOf?: string }) {
    const content = text.trim();
    if (!content || pending) return;
    if (needsLeadGate(session) && !options?.retryOf) return;

    const userTurn: ChatTurn = { id: options?.retryOf ?? newId(), role: "user", content, status: "complete" };
    const pendingTurn: ChatTurn = { id: newId(), role: "assistant", content: "", status: "pending" };

    update((current) => {
      const base = options?.retryOf
        ? current.messages.filter((turn) => turn.status !== "error" && turn.status !== "pending")
        : current.messages.filter((turn) => turn.status !== "pending");
      const alreadyHasUser = base.some((turn) => turn.id === userTurn.id);
      const messages = alreadyHasUser ? [...base, pendingTurn] : [...base, userTurn, pendingTurn];
      return {
        ...current,
        journey: "use",
        messages,
        conversationEvents: recordEvent(current, "question_started").conversationEvents,
      };
    });
    setDraft("");
    trackAiActEvent("ai_act_question_started", { locale, retry: Boolean(options?.retryOf) });

    const completeTurns = session.messages.filter((turn) => turn.status === "complete");
    const historyTurns = completeTurns.some((turn) => turn.id === userTurn.id) ? completeTurns : [...completeTurns, userTurn];
    const history = historyTurns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    try {
      const response = await fetch("/api/ai-act/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: ensure().anonymousSessionId,
          locale,
          messages: history,
        }),
      });
      const data = (await response.json()) as AiActChatResponse;
      if (!data.ok && data.error.code === "lead_required") {
        setDraft(content);
        update((current) => ({
          ...current,
          questionsAsked: Math.max(current.questionsAsked, ANONYMOUS_QUESTION_LIMIT),
          messages: current.messages.filter((turn) => turn.id !== pendingTurn.id && turn.id !== userTurn.id),
        }));
        return;
      }
      update((current) => ({
        ...current,
        questionsAsked: data.ok ? current.questionsAsked + 1 : current.questionsAsked,
        messages: current.messages.map((turn) => {
          if (turn.id !== pendingTurn.id) return turn;
          if (data.ok) return { ...turn, status: "complete" as const, content: data.message.content };
          return { ...turn, status: "error" as const, errorCode: data.error.code, content: "" };
        }),
      }));
      if (!data.ok) setDraft(content);
    } catch {
      setDraft(content);
      update((current) => ({
        ...current,
        messages: current.messages.map((turn) =>
          turn.id === pendingTurn.id ? { ...turn, status: "error", errorCode: "network", content: "" } : turn,
        ),
      }));
    }
  }

  function remainingLabel(): string {
    if (session.leadCaptured) return copy.chat.remaining.open[locale];
    if (remaining <= 0) return copy.chat.remaining.none[locale];
    if (remaining === 1) return copy.chat.remaining.one[locale];
    return copy.chat.remaining.two[locale];
  }

  function lastUserContent(): string | undefined {
    for (let i = session.messages.length - 1; i >= 0; i -= 1) {
      const turn = session.messages[i];
      if (turn?.role === "user") return turn.content;
    }
    return undefined;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper pt-24 md:pt-28">
      <ProductChrome locale={locale} title={copy.chat.title[locale]} aside={remainingLabel()} />

      <Container className="flex min-h-0 flex-1 flex-col pb-0">
        <div ref={logRef} className="min-h-[14rem] flex-1 overflow-y-auto py-6 md:py-8" aria-live="polite" aria-relevant="additions">
          {session.messages.length === 0 ? (
            <div>
              <p className="max-w-[54ch] text-small text-ink-2">{copy.chat.empty[locale]}</p>
              <p className="mt-8 label">{copy.chat.startersLabel[locale]}</p>
              <ul className="mt-3 grid gap-2">
                {copy.chat.starters.map((item) => (
                  <li key={item.en}>
                    <button
                      type="button"
                      onClick={() => void send(item[locale])}
                      disabled={pending || gate}
                      className="w-full rounded-[1.25rem] bg-white px-4 py-3 text-left text-small text-ink transition-colors duration-150 hover:bg-marine-tint disabled:opacity-60"
                    >
                      {item[locale]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="grid gap-5">
              {session.messages.map((turn) => (
                <li key={turn.id}>
                  <p className="label">{turn.role === "user" ? copy.chat.you[locale] : copy.chat.assistant[locale]}</p>
                  {turn.status === "pending" ? (
                    <p className="mt-2 text-small text-ink-3">{copy.chat.generating[locale]}</p>
                  ) : turn.status === "error" ? (
                    <div className="mt-2 max-w-[60ch]">
                      <p className="text-small text-ink-2">{errorCopy(locale, turn.errorCode)}</p>
                      <button
                        type="button"
                        className="mt-3 text-small font-medium text-signal underline decoration-transparent underline-offset-[4px] hover:decoration-signal"
                        onClick={() => {
                          const last = lastUserContent();
                          if (last) void send(last, { retryOf: session.messages.find((item) => item.role === "user" && item.content === last)?.id });
                        }}
                      >
                        {copy.chat.retry[locale]}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 max-w-[60ch] text-body text-ink whitespace-pre-wrap">{turn.content}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="ai-act-composer sticky bottom-0 z-10 border-t border-line bg-paper pt-4">
          {gate ? (
            <div className="pb-4">
              {gateThanks ? <p className="mb-4 text-small text-ink-2">{copy.lead.thanks[locale]}</p> : null}
              <LeadCapture locale={locale} reason="chat" onCompleted={() => setGateThanks(true)} />
            </div>
          ) : (
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                void send(draft);
              }}
            >
              <div className="min-w-0 flex-1">
                <label htmlFor={inputId} className="sr-only">
                  {copy.chat.placeholder[locale]}
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
                  maxLength={AI_ACT_MESSAGE_MAX_LENGTH}
                  disabled={pending}
                  enterKeyHint="send"
                  placeholder={copy.chat.placeholder[locale]}
                  className="w-full resize-none rounded-[1.25rem] bg-white px-4 py-3 font-sans text-base leading-normal text-ink outline-none placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:text-small"
                />
              </div>
              <Button type="submit" disabled={pending || draft.trim().length === 0} className="w-full min-h-11 shrink-0 sm:w-auto">
                {pending ? copy.chat.sending[locale] : copy.chat.send[locale]}
              </Button>
            </form>
          )}
          <p className="mt-3 max-w-[70ch] pb-1 text-[0.75rem] leading-5 text-ink-3">{copy.chat.notice[locale]}</p>
        </div>
      </Container>
    </div>
  );
}
