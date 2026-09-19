import { AiActProviderError } from "../errors";

export async function providerFetch(url: string, init: RequestInit, timeoutMs = 20_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "AbortError" || name === "TimeoutError") {
      throw new AiActProviderError("timeout", "provider timed out");
    }
    throw new AiActProviderError("network", "provider network error");
  } finally {
    clearTimeout(timer);
  }
}
