import { isRequestId, SIGNATURE_MAX_SKEW_SECONDS } from "./constants";

export interface SignatureParts {
  secret: string;
  timestamp: string;
  method: string;
  path: string;
  requestId: string;
  body: Uint8Array;
  signature?: string;
}

export type SignatureResult = "ok" | "invalid" | "expired";

const TIMESTAMP_PATTERN = /^[0-9]{10}$/;
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/;

/**
 * Canonical bytes are:
 * `${timestamp}.${METHOD}.${path}.${requestId}.` + raw body.
 * Method and path are included so a signed body cannot be replayed
 * against a different route. The request id is included so it cannot be swapped.
 */
export function canonicalBytes(parts: Omit<SignatureParts, "secret" | "signature">): Uint8Array<ArrayBuffer> {
  const prefix = new TextEncoder().encode(
    `${parts.timestamp}.${parts.method.toUpperCase()}.${parts.path}.${parts.requestId.toLowerCase()}.`,
  );
  const buffer = new ArrayBuffer(prefix.byteLength + parts.body.byteLength);
  const out = new Uint8Array(buffer);
  copyInto(out, prefix, 0);
  copyInto(out, parts.body, prefix.byteLength);
  return out;
}

export async function signRequest(parts: SignatureParts): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(parts.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, canonicalBytes(parts));
  return toHex(signature);
}

export async function verifySignature(
  parts: SignatureParts & { signature: string; nowSeconds: number; maxSkewSeconds?: number },
): Promise<SignatureResult> {
  if (!TIMESTAMP_PATTERN.test(parts.timestamp)) return "invalid";
  if (!SIGNATURE_PATTERN.test(parts.signature)) return "invalid";
  if (!isRequestId(parts.requestId)) return "invalid";

  const expected = await signRequest(parts);
  if (!safeEqual(expected, parts.signature)) return "invalid";

  const skew = Math.abs(parts.nowSeconds - Number(parts.timestamp));
  if (skew > (parts.maxSkewSeconds ?? SIGNATURE_MAX_SKEW_SECONDS)) return "expired";
  return "ok";
}

export function safeEqual(left: string, right: string): boolean {
  const encodedLeft = new TextEncoder().encode(left);
  const encodedRight = new TextEncoder().encode(right);
  const length = Math.max(encodedLeft.byteLength, encodedRight.byteLength);
  let diff = encodedLeft.byteLength ^ encodedRight.byteLength;
  for (let index = 0; index < length; index += 1) {
    diff |= (encodedLeft[index] ?? 0) ^ (encodedRight[index] ?? 0);
  }
  if (diff !== 0) return false;
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (leftBytes: BufferSource, rightBytes: BufferSource) => boolean;
  };
  if (typeof subtle.timingSafeEqual === "function") {
    return subtle.timingSafeEqual(encodedLeft, encodedRight);
  }
  return true;
}

function copyInto(target: Uint8Array<ArrayBuffer>, source: Uint8Array, offset: number): void {
  for (let index = 0; index < source.byteLength; index += 1) {
    const byte = source[index];
    if (byte !== undefined) target[offset + index] = byte;
  }
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
