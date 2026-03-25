import type { NextRequest } from "next/server";

export const USER_ID_COOKIE_NAME = "applytrack_user_id";
export const USER_ID_HEADER_NAME = "x-applytrack-user-id";

type HeaderReader = {
  get(name: string): string | null | undefined;
};

export function getUserIdFromHeaders(headers: HeaderReader): string | null {
  const userId = headers.get(USER_ID_HEADER_NAME);

  return typeof userId === "string" && userId.trim() ? userId : null;
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  return getUserIdFromHeaders(request.headers) ?? request.cookies.get(USER_ID_COOKIE_NAME)?.value ?? null;
}