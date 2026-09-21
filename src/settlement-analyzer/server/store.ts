import "server-only";

import { createSupabaseAnonClient } from "@/lib/cms/supabase-server";
import { supabaseConfigured } from "@/lib/cms/mode";

export class StoreUnavailableError extends Error {
  constructor(message = "Базата данни временно не е достъпна.") {
    super(message);
    this.name = "StoreUnavailableError";
  }
}

type RpcResult = Record<string, unknown> | null;

function client() {
  if (!supabaseConfigured()) throw new StoreUnavailableError();
  return createSupabaseAnonClient();
}

async function rpc<T extends RpcResult>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client().rpc(name, args);
  if (error) {
    console.error("[settlement-analyzer] rpc failed", name);
    throw new StoreUnavailableError();
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new StoreUnavailableError();
  }
  return data as T;
}

export type BootstrapRecord = {
  sessionId: string;
  contactId: string | null;
  registered: boolean;
  fullName?: string;
  profileCompleted: boolean;
  analysisCount: number;
};

export async function bootstrapStore(input: {
  sessionId: string | null;
  contactId: string | null;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
}): Promise<BootstrapRecord> {
  const row = await rpc<BootstrapRecord & { sessionId: string }>("land_scope_bootstrap", {
    p_session_id: input.sessionId ?? "",
    p_contact_id: input.contactId ?? "",
    p_source: input.source,
    p_utm_source: input.utmSource,
    p_utm_medium: input.utmMedium,
    p_utm_campaign: input.utmCampaign,
    p_utm_content: input.utmContent,
  });
  return {
    sessionId: String(row.sessionId),
    contactId: row.contactId ? String(row.contactId) : null,
    registered: Boolean(row.registered),
    fullName: typeof row.fullName === "string" ? row.fullName : undefined,
    profileCompleted: Boolean(row.profileCompleted),
    analysisCount: Number(row.analysisCount ?? 0),
  };
}

export async function registerStore(sessionId: string, payload: Record<string, unknown>) {
  return rpc<{ ok?: boolean; existing?: boolean; fullName?: string; contactId?: string; error?: string }>(
    "land_scope_register",
    { p_session_id: sessionId, p_payload: payload },
  );
}

export async function recordEventStore(sessionId: string, contactId: string | null, eventName: string, properties: string) {
  return rpc("land_scope_record_event", {
    p_session_id: sessionId,
    p_contact_id: contactId ?? "",
    p_event_name: eventName,
    p_properties: properties,
  });
}

export async function recordAnalysisStore(sessionId: string, contactId: string | null, settlementName: string, summary: string) {
  return rpc<{ ok?: boolean; recorded?: boolean; analysisCount?: number }>("land_scope_record_analysis", {
    p_session_id: sessionId,
    p_contact_id: contactId ?? "",
    p_settlement_name: settlementName,
    p_summary: summary,
  });
}

export async function saveProfileStore(sessionId: string, contactId: string, payload: Record<string, unknown>) {
  return rpc<{ ok?: boolean; error?: string }>("land_scope_save_profile", {
    p_session_id: sessionId,
    p_contact_id: contactId,
    p_payload: payload,
  });
}
