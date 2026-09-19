import { createHash } from "node:crypto";
import type { StoredAiActLead } from "./types";

export async function notifyLead(lead: StoredAiActLead): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "ITT Digital Hub <noreply@mail.ittdigitalhub.uk>";
  if (!key || !to) return;

  const text = [
    `Name: ${lead.name}`,
    `Work email: ${lead.workEmail}`,
    `Company: ${lead.company}`,
    `Role: ${lead.role}`,
    `Marketing consent: ${lead.marketingConsent ? "yes" : "no"}`,
    `Source: ${lead.source}`,
    `Session: ${lead.sessionId}`,
    lead.campaign ? `Campaign: ${lead.campaign}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const idempotencyKey = `ai-act-lead/${createHash("sha256").update(`${lead.workEmail}:${lead.createdAt}`).digest("hex").slice(0, 32)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `ITT AI Act lead: ${lead.company.slice(0, 80)}`,
      text,
    }),
  });

  if (!response.ok) {
    console.error("[ai-act] lead notify", response.status);
  }
}
