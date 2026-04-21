import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { archiveRmInvitation, getRmErrorResponse } from "@/lib/rm";

export async function POST(
  _request: Request,
  context: { params: Promise<{ invitationId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { invitationId } = await context.params;
    const result = await archiveRmInvitation(invitationId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/rm/invitations/[invitationId]/archive" },
    });
    const { message, status } = getRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}