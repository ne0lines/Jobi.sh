import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { getRmErrorResponse, resendRmConnectionRequest } from "@/lib/rm";

export async function POST(
  _request: Request,
  context: { params: Promise<{ requestId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { requestId } = await context.params;
    const result = await resendRmConnectionRequest(requestId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/requests/by-id/[requestId]/resend" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}