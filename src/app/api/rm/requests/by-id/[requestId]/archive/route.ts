import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { archiveRmConnectionRequest, getRmErrorResponse } from "@/lib/rm";

export async function POST(
  _request: Request,
  context: { params: Promise<{ requestId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { requestId } = await context.params;
    const result = await archiveRmConnectionRequest(requestId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/requests/by-id/[requestId]/archive" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}