import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { archiveRmConnection, getRmErrorResponse } from "@/lib/rm";

export async function POST(
  _request: Request,
  context: { params: Promise<{ connectionId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { connectionId } = await context.params;
    const result = await archiveRmConnection(connectionId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/connections/[connectionId]/archive" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}