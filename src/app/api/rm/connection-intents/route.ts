import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { RmConnectionIntentResponse } from "@/app/types";
import { createRmConnectionIntent, getRmErrorResponse } from "@/lib/rm";

type ConnectionIntentInput = {
  email?: string;
  name?: string;
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RmConnectionIntentResponse | { error: string }>> {
  try {
    const input = (await request.json()) as ConnectionIntentInput;

    if (!input.email) {
      return NextResponse.json(
        { error: "E-postadress krävs." },
        { status: 400 },
      );
    }

    const result = await createRmConnectionIntent(input.email, input.name);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/connection-intents" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}