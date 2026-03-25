import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "applytrack_session";
export const USER_ID_HEADER_NAME = "x-applytrack-user-id";

type HeaderReader = {
  get(name: string): string | null | undefined;
};

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.CRON_SECRET ?? "applytrack-local-dev-secret";
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signUserId(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(getAuthSecret());
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    secret,
    {
      hash: "SHA-256",
      name: "HMAC",
    },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(userId));

  return bytesToHex(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= (left.codePointAt(index) ?? 0) ^ (right.codePointAt(index) ?? 0);
  }

  return result === 0;
}

export async function createSessionValue(userId: string): Promise<string> {
  return `${userId}.${await signUserId(userId)}`;
}

export async function verifySessionValue(value: string | undefined | null): Promise<string | null> {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");

  if (!userId || !signature) {
    return null;
  }

  const expectedSignature = await signUserId(userId);
  return constantTimeEqual(signature, expectedSignature) ? userId : null;
}

export function getUserIdFromHeaders(headers: HeaderReader): string | null {
  const userId = headers.get(USER_ID_HEADER_NAME);
  return typeof userId === "string" && userId.trim() ? userId : null;
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  return getUserIdFromHeaders(request.headers) ?? (await verifySessionValue(request.cookies.get(AUTH_COOKIE_NAME)?.value));
}