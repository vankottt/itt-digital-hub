"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { readCampaignParams } from "@/lib/ai-act/campaign";
import {
  ensureAiActSession,
  getClientAiActSession,
  getServerAiActSession,
  subscribeAiActSession,
  writeAiActSession,
} from "@/lib/ai-act/session-store";
import { applyLeadToSession } from "@/lib/ai-act/session";
import type { AiActSession } from "@/lib/ai-act/types";

type SessionUpdater = Partial<AiActSession> | ((current: AiActSession) => AiActSession);

type AiActSessionContextValue = {
  session: AiActSession;
  ready: boolean;
  update: (patch: SessionUpdater) => void;
  ensure: () => AiActSession;
};

const AiActSessionContext = createContext<AiActSessionContextValue | null>(null);

function CampaignCapture({ session, update }: { session: AiActSession; update: (patch: SessionUpdater) => void }) {
  const searchParams = useSearchParams();
  const source = searchParams.get("src") ?? searchParams.get("utm_source");
  const campaign = searchParams.get("campaign") ?? searchParams.get("utm_campaign");

  useEffect(() => {
    const next = readCampaignParams({
      get(name: string) {
        if (name === "src" || name === "utm_source") return source;
        if (name === "campaign" || name === "utm_campaign") return campaign;
        return null;
      },
    });
    if (!next.source && !next.campaign) return;
    if (session.source && session.campaign) return;
    if (session.source === next.source && session.campaign === next.campaign) return;
    update((current) => ({
      ...current,
      source: current.source || next.source,
      campaign: current.campaign || next.campaign,
    }));
  }, [source, campaign, session.source, session.campaign, update]);

  return null;
}

export function AiActSessionProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeAiActSession, getClientAiActSession, getServerAiActSession);
  const ready = Boolean(session.anonymousSessionId);

  const update = useCallback((patch: SessionUpdater) => {
    const current = ensureAiActSession();
    writeAiActSession(typeof patch === "function" ? patch(current) : { ...current, ...patch });
  }, []);

  useEffect(() => {
    void fetch("/api/ai-act/session")
      .then((response) => response.json())
      .then((data: { ok?: boolean; leadCaptured?: boolean; questionsAsked?: number; lead?: Pick<AiActSession, "name" | "workEmail" | "company" | "role" | "marketingConsent"> }) => {
        if (!data?.ok) return;
        update((current) => {
          let next = current;
          if (typeof data.questionsAsked === "number" && data.questionsAsked > current.questionsAsked) {
            next = { ...next, questionsAsked: data.questionsAsked };
          }
          if (data.leadCaptured && data.lead && !current.leadCaptured) {
            return applyLeadToSession(next, data.lead);
          }
          return next;
        });
      })
      .catch(() => undefined);
  }, [update]);

  const value = useMemo(() => ({ session, ready, update, ensure: ensureAiActSession }), [session, ready, update]);

  return (
    <AiActSessionContext.Provider value={value}>
      <Suspense fallback={null}>
        <CampaignCapture session={session} update={update} />
      </Suspense>
      {children}
    </AiActSessionContext.Provider>
  );
}

export function useAiActSession(): AiActSessionContextValue {
  const value = useContext(AiActSessionContext);
  if (!value) throw new Error("useAiActSession must be used within AiActSessionProvider");
  return value;
}
