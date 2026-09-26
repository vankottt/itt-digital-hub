export function chatGptDestination(env: Record<string, string | undefined> = process.env): {
  state: "published" | "awaiting_publication";
  url: string;
  configLocation: "VIK_CHATGPT_DESTINATION_URL";
} {
  const raw = env.VIK_CHATGPT_DESTINATION_URL?.trim() ?? "";
  if (!raw) return { state: "awaiting_publication", url: "", configLocation: "VIK_CHATGPT_DESTINATION_URL" };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return { state: "awaiting_publication", url: "", configLocation: "VIK_CHATGPT_DESTINATION_URL" };
    return { state: "published", url: url.toString(), configLocation: "VIK_CHATGPT_DESTINATION_URL" };
  } catch {
    return { state: "awaiting_publication", url: "", configLocation: "VIK_CHATGPT_DESTINATION_URL" };
  }
}
