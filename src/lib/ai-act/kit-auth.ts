import "server-only";

export async function gateAllowsKitDownload(token: string): Promise<boolean> {
  const configured = process.env.AGENT_GATEWAY_ORIGIN?.trim() || process.env.NEXT_PUBLIC_AGENT_GATEWAY_ORIGIN?.trim();
  const origin = (configured || "https://api.ittdigitalhub.org").replace(/\/$/, "");
  try {
    const response = await fetch(`${origin}/v1/agents/ai-act/actions/authorize`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locale: "en",
        input: { purpose: "kit" },
        clientState: { gate: token },
      }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { result?: { allowed?: boolean } };
    return data.result?.allowed === true;
  } catch {
    return false;
  }
}
