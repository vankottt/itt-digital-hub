interface BodySource {
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
}

export async function readBodyWithLimit(
  source: BodySource,
  maxBytes: number,
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; reason: "too_large" | "unreadable" }> {
  const declared = source.headers.get("content-length");
  if (declared !== null && /^\d+$/.test(declared) && Number(declared) > maxBytes) {
    await source.body?.cancel();
    return { ok: false, reason: "too_large" };
  }

  if (!source.body) return { ok: true, bytes: new Uint8Array() };

  const reader = source.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    await reader.cancel().catch(() => undefined);
    return { ok: false, reason: "unreadable" };
  }

  const bytes = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const chunk of chunks) {
    copyInto(bytes, chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}

export function isJsonContentType(value: string | null): boolean {
  if (!value) return false;
  const media = value.split(";")[0]?.trim().toLowerCase();
  return media === "application/json";
}

export function decodeJson(bytes: Uint8Array): { ok: true; value: unknown } | { ok: false } {
  try {
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function copyInto(target: Uint8Array<ArrayBuffer>, source: Uint8Array, offset: number): void {
  for (let index = 0; index < source.byteLength; index += 1) {
    const byte = source[index];
    if (byte !== undefined) target[offset + index] = byte;
  }
}
