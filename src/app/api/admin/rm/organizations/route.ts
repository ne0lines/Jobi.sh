import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { createRmOrganization, getAdminRmErrorResponse } from "@/lib/admin-rm";

type CreateRmOrganizationInput = {
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

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const input = (await request.json()) as CreateRmOrganizationInput;
    const result = await createRmOrganization({
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
      slug: input.slug,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: "POST /api/admin/rm/organizations" },
    });
    const { message, status } = getAdminRmErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}