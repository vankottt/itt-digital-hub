import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { AiActLeadInput, AiActLeadSource, StoredAiActLead } from "../../../../src/lib/ai-act/types";

export interface SupabaseLeadRow {
  id: string;
  name: string;
  work_email: string;
  company: string;
  role: string;
  marketing_consent: boolean;
  session_id: string;
  source: AiActLeadSource;
  campaign: string | null;
  created_at: string;
}

type LeadTarget = "supabase" | "local" | "unavailable";

export function toSupabaseRow(lead: StoredAiActLead): SupabaseLeadRow {
  return {
    id: lead.id,
    name: lead.name,
    work_email: lead.workEmail,
    company: lead.company,
    role: lead.role,
    marketing_consent: lead.marketingConsent,
    session_id: lead.sessionId,
    source: lead.source,
    campaign: lead.campaign ?? null,
    created_at: lead.createdAt,
  };
}

export function leadFromInput(input: AiActLeadInput, id: string = randomUUID(), createdAt: string = new Date().toISOString()): StoredAiActLead {
  return {
    id,
    name: input.name,
    workEmail: input.workEmail,
    company: input.company,
    role: input.role,
    marketingConsent: input.marketingConsent,
    sessionId: input.anonymousSessionId,
    source: input.journey === "build" ? "agent_kit" : "hosted_assistant",
    campaign: input.campaign || input.source,
    createdAt,
  };
}

export function leadStorageTarget(env: NodeJS.ProcessEnv = process.env): LeadTarget {
  if (supabaseCredentials(env)) return "supabase";
  if (env.NODE_ENV === "production" || env.NODE_ENV === "test") return "unavailable";
  return "local";
}

export async function persistAiActLead(input: AiActLeadInput, env: NodeJS.ProcessEnv = process.env): Promise<StoredAiActLead> {
  const lead = leadFromInput(input);
  const target = leadStorageTarget(env);
  if (target === "supabase") {
    await insertSupabaseLead(lead, env);
    return lead;
  }
  if (target === "unavailable") {
    console.error("[ai-act] lead persist unavailable");
    throw new Error("lead persist unavailable");
  }
  return persistLocalLead(lead);
}

export async function insertSupabaseLead(lead: StoredAiActLead, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const credentials = supabaseCredentials(env);
  if (!credentials) throw new Error("lead persist unavailable");
  const supabase = createClient(credentials.url, credentials.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("ai_act_leads").insert(toSupabaseRow(lead));
  if (error) {
    console.error("[ai-act] lead persist failed");
    throw new Error("lead persist failed");
  }
}

function supabaseCredentials(env: NodeJS.ProcessEnv): { url: string; key: string } | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim();
  const key =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

async function persistLocalLead(lead: StoredAiActLead): Promise<StoredAiActLead> {
  const directory = path.join(process.cwd(), ".data", "ai-act");
  const file = path.join(directory, "leads.json");
  await mkdir(directory, { recursive: true });
  let leads: StoredAiActLead[] = [];
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as { leads?: StoredAiActLead[] };
    if (Array.isArray(parsed.leads)) leads = parsed.leads;
  } catch {
    leads = [];
  }
  leads.push(lead);
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify({ leads }, null, 2), "utf8");
  await rename(tmp, file);
  return lead;
}
