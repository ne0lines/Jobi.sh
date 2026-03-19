import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, createSessionValue } from "@/server/auth-session";
import { getUserByEmail, verifyPassword } from "@/server/users";

type AuthPayload = {
  email?: string;
  password?: string;
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ email: string; id: string } | { error: string }>> {
  const payload = (await request.json()) as AuthPayload;
  const email = payload.email ?? "";
  const password = payload.password ?? "";
  const user = await getUserByEmail(email);

  if (!user || !verifyPassword(user, password)) {
    return NextResponse.json({ error: "Fel e-postadress eller lösenord." }, { status: 401 });
  }

  const response = NextResponse.json({ email: user.email, id: user.id });
  const sessionValue = await createSessionValue(user.id);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: sessionValue,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}