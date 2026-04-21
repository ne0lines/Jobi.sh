import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { RmConnectionIntentLookupResponse } from "@/app/types";
import { getRmErrorResponse, lookupRmConnectionIntentEmail } from "@/lib/rm";

type ConnectionIntentLookupInput = {
  email?: string;
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RmConnectionIntentLookupResponse | { error: string }>> {
  try {
    const input = (await request.json()) as ConnectionIntentLookupInput;

    if (!input.email) {
      return NextResponse.json(
        { error: "E-postadress krävs." },
        { status: 400 },
      );
    }

    const result = await lookupRmConnectionIntentEmail(input.email);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/connection-intents/lookup" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}