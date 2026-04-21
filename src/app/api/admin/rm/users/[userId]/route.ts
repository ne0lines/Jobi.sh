import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/app/generated/prisma/enums";
import { getAdminRmErrorResponse, updateRmUserMembership } from "@/lib/admin-rm";

type UpdateRmUserInput = {
  rmOrganizationId?: string | null;
  role?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { userId } = await context.params;
    const input = (await request.json()) as UpdateRmUserInput;

    if (input.role !== UserRole.user && input.role !== UserRole.admin && input.role !== UserRole.rm) {
      return NextResponse.json({ error: "Ogiltig användarroll." }, { status: 400 });
    }

    const result = await updateRmUserMembership({
      rmOrganizationId: input.rmOrganizationId,
      role: input.role,
      userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "PATCH /api/admin/rm/users/[userId]" },
    });
    const { message, status } = getAdminRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}