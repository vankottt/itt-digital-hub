import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { createSupabaseAnonClient } from "@/lib/cms/supabase-server";
import { leadStorageTarget } from "./lead-target";
import type { AiActLeadInput, AiActLeadSource, StoredAiActLead } from "./types";

interface LeadFileStore {
  leads: StoredAiActLead[];
}

function storeDir(): string {
  return process.env.VERCEL ? path.join("/tmp", "ai-act") : path.join(process.cwd(), ".data", "ai-act");
}

function storeFile(): string {
  return path.join(storeDir(), "leads.json");
}

function sourceFromJourney(journey: AiActLeadInput["journey"]): AiActLeadSource {
  return journey === "build" ? "agent_kit" : "hosted_assistant";
}

function fromInput(input: AiActLeadInput, id = randomUUID()): StoredAiActLead {
  return {
    id,
    name: input.name,
    workEmail: input.workEmail,
    company: input.company,
    role: input.role,
    marketingConsent: input.marketingConsent,
    sessionId: input.anonymousSessionId,
    source: sourceFromJourney(input.journey),
    campaign: input.campaign || input.source,
    createdAt: new Date().toISOString(),
  };
}

async function persistLocal(lead: StoredAiActLead): Promise<StoredAiActLead> {
  await mkdir(storeDir(), { recursive: true });
  let data: LeadFileStore = { leads: [] };
  try {
    data = JSON.parse(await readFile(storeFile(), "utf8")) as LeadFileStore;
    if (!Array.isArray(data.leads)) data = { leads: [] };
  } catch {
    data = { leads: [] };
  }
  data.leads.push(lead);
  const tmp = `${storeFile()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, storeFile());
  return lead;
}

async function persistSupabase(lead: StoredAiActLead): Promise<StoredAiActLead> {
  const supabase = createSupabaseAnonClient();
  const { error } = await supabase.from("ai_act_leads").insert({
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
  });
  if (error) {
    console.error("[ai-act] lead persist failed");
    throw error;
  }
  return lead;
}

export async function persistLead(input: AiActLeadInput): Promise<StoredAiActLead> {
  const lead = fromInput(input);
  const target = leadStorageTarget();
  if (target === "supabase") return persistSupabase(lead);
  if (target === "unavailable") {
    console.error("[ai-act] lead persist unavailable without supabase");
    throw new Error("supabase required for hosted lead persistence");
  }
  return persistLocal(lead);
}
