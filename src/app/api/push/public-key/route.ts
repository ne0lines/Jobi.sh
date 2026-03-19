import { NextResponse } from "next/server";

import { getPublicVapidKey } from "@/server/push";

export async function GET(): Promise<NextResponse<{ publicKey?: string; error?: string }>> {
  const publicKey = getPublicVapidKey();

  if (!publicKey) {
    return NextResponse.json(
      { error: "Pushnotiser är inte konfigurerade än." },
      { status: 503 },
    );
  }

  return NextResponse.json({ publicKey });
}