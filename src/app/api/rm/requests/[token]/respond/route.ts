import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { RmRequestDecision } from "@/app/types";
import { getRmErrorResponse, respondToRmConnectionRequest } from "@/lib/rm";

type RespondRequestInput = {
  decision?: RmRequestDecision;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
): Promise<NextResponse<{ message: string; status: string } | { error: string }>> {
  try {
    const { token } = await context.params;
    const input = (await request.json()) as RespondRequestInput;

    if (input.decision !== "accept" && input.decision !== "decline") {
      return NextResponse.json(
        { error: "Ogiltigt svar på kopplingsförfrågan." },
        { status: 400 },
      );
    }

    const result = await respondToRmConnectionRequest(token, input.decision);

    return NextResponse.json({
      message: result.message,
      status: result.status,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/requests/[token]/respond" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}