import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/server/auth-session";

export async function POST(): Promise<NextResponse<{ success: boolean }>> {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}