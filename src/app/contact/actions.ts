"use server";

import { headers } from "next/headers";
import { formatContactMessage, parseContactForm } from "@/lib/contact";

export type ContactActionState = {
  status: "idle" | "ok" | "invalid" | "error";
};

const windowMs = 60 * 60 * 1000;
const maxPerWindow = 5;
const hits = new Map<string, number[]>();

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function rateLimited(): Promise<boolean> {
  const now = Date.now();
  const key = await clientKey();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= maxPerWindow) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function deliveryConfigured(): boolean {
  return Boolean(process.env.CONTACT_TO_EMAIL?.trim() && process.env.RESEND_API_KEY?.trim());
}

async function deliver(text: string, name: string): Promise<boolean> {
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "ITT Digital Hub <onboarding@resend.dev>";
  if (!to || !key) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `ITT enquiry — ${name.slice(0, 80)}`,
      text,
    }),
  });
  return response.ok;
}

export async function submitContact(_prev: ContactActionState, formData: FormData): Promise<ContactActionState> {
  const parsed = parseContactForm(formData);
  if (parsed.kind === "spam") return { status: "ok" };
  if (parsed.kind === "invalid") return { status: "invalid" };
  if (await rateLimited()) return { status: "error" };

  const text = formatContactMessage(parsed.data);
  if (!deliveryConfigured()) {
    if (process.env.NODE_ENV === "production") return { status: "error" };
    console.info("[contact form]", text);
    return { status: "ok" };
  }

  const sent = await deliver(text, parsed.data.name);
  return { status: sent ? "ok" : "error" };
}
