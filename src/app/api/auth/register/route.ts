import { NextRequest, NextResponse } from "next/server";

import { createUser } from "@/server/users";
import { AUTH_COOKIE_NAME, createSessionValue } from "@/server/auth-session";

type AuthPayload = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Lösenordet måste vara minst 8 tecken.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Lösenordet måste innehålla minst en stor bokstav.";
  }

  if (!/[a-z]/.test(password)) {
    return "Lösenordet måste innehålla minst en liten bokstav.";
  }

  if (!/\d/.test(password)) {
    return "Lösenordet måste innehålla minst en siffra.";
  }

  return null;
}

function validateInput(email: string, password: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return "Ange en giltig e-postadress.";
  }

  return validatePassword(password);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ email: string; id: string } | { error: string }>> {
  try {
    const payload = (await request.json()) as AuthPayload;
    const email = payload.email ?? "";
    const password = payload.password ?? "";
    const validationError = validateInput(email, password);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const user = await createUser(email, password);
    const response = NextResponse.json({ email: user.email, id: user.id }, { status: 201 });
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
  } catch (error) {
    const statusCode = error instanceof Error && error.message === "E-postadressen används redan." ? 409 : 500;

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunde inte skapa kontot." },
      { status: statusCode },
    );
  }
}