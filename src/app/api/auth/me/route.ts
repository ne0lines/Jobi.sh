import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/server/auth-session";
import { getUserById } from "@/server/users";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<{ email: string; id: string } | { error: string }>> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await getUserById(userId);

  if (!user) {
    return NextResponse.json({ error: "Användaren kunde inte hittas." }, { status: 401 });
  }

  return NextResponse.json({ email: user.email, id: user.id });
}