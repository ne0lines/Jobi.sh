import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminRmErrorResponse, setRmOrganizationArchivedState, updateRmOrganization } from "@/lib/admin-rm";

type UpdateRmOrganizationInput = {
  archivedAt?: string | null;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingCountry?: string;
  billingEmail?: string;
  billingName?: string;
  billingOrganizationNumber?: string;
  billingPostalCode?: string;
  billingReference?: string;
  billingVatNumber?: string;
  name?: string;
  slug?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ organizationId: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { organizationId } = await context.params;
    const input = (await request.json()) as UpdateRmOrganizationInput;

    if (input.archivedAt !== undefined) {
      const result = await setRmOrganizationArchivedState({
        archivedAt: input.archivedAt,
        organizationId,
      });

      return NextResponse.json(result, { status: 200 });
    }

    const result = await updateRmOrganization({
      billingAddressLine1: input.billingAddressLine1 ?? "",
      billingAddressLine2: input.billingAddressLine2,
      billingCity: input.billingCity ?? "",
      billingCountry: input.billingCountry,
      billingEmail: input.billingEmail ?? "",
      billingName: input.billingName ?? "",
      billingOrganizationNumber: input.billingOrganizationNumber ?? "",
      billingPostalCode: input.billingPostalCode ?? "",
      billingReference: input.billingReference,
      billingVatNumber: input.billingVatNumber,
      name: input.name ?? "",
      organizationId,
      slug: input.slug ?? "",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "PATCH /api/admin/rm/organizations/[organizationId]" },
    });
    const { message, status } = getAdminRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}