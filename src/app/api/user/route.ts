import { UserRole } from "@/app/generated/prisma/enums";
import { TERMS_VERSION } from "@/lib/legal";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type User = {
  complete: boolean;
  email: string;
  name: string;
  profession: string;
  role: UserRole;
  id: string;
  termsAcceptedAt: Date | null;
  termsVersion: string | null;
  onboardingDismissed: boolean;
  onboardingPipelineExplored: boolean;
  onboardingReportViewed: boolean;
};

const userSelect = {
  complete: true,
  email: true,
  id: true,
  name: true,
  profession: true,
  role: true,
  termsAcceptedAt: true,
  termsVersion: true,
  onboardingDismissed: true,
  onboardingPipelineExplored: true,
  onboardingReportViewed: true,
} as const;

export async function GET(
  req: NextRequest,
): Promise<NextResponse<User | { error: string } | unknown>> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "Ingen e-postadress hittades." },
      { status: 400 },
    );
  }

  let dbData;
  try {
    dbData = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  } catch (err) {
    logger.error("Failed to fetch user profile", { userId: clerkUser.id });
    Sentry.captureException(err, { tags: { route: "GET /api/user" } });
    return NextResponse.json({ error: "Det gick inte att hämta profilen." }, { status: 500 });
  }

  if (!dbData) {
    return NextResponse.redirect(new URL("/konto/create-profile", req.url));
  }

  return NextResponse.json(dbData as User);
}

type CreateProfileInput = {
  name: string;
  profession: string;
  termsAccepted: boolean;
  termsVersion?: string;
};

export async function POST(
  req: NextRequest,
): Promise<NextResponse<User | { error: string }>> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "Ingen e-postadress hittades." },
      { status: 400 },
    );
  }

  const { name, profession, termsAccepted, termsVersion } =
    (await req.json()) as CreateProfileInput;

  if (!name || !profession) {
    return NextResponse.json(
      { error: "Namn och yrke måste anges." },
      { status: 400 },
    );
  }

  if (!termsAccepted) {
    return NextResponse.json(
      { error: "Du måste godkänna användarvillkoren." },
      { status: 400 },
    );
  }

  if (termsVersion !== TERMS_VERSION) {
    return NextResponse.json(
      {
        error:
          "Villkoren har uppdaterats. Läs och godkänn den senaste versionen.",
      },
      { status: 400 },
    );
  }

  let userData;
  try {
    userData = await prisma.user.upsert({
      where: { email },
      create: {
        id: clerkUser.id,
        email,
        name,
        profession,
        complete: true,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
      update: {
        name,
        profession,
        complete: true,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
      select: userSelect,
    });
  } catch (err) {
    logger.error("Failed to upsert user profile", { userId: clerkUser.id });
    Sentry.captureException(err, { tags: { route: "POST /api/user" } });
    return NextResponse.json({ error: "Det gick inte att spara profilen." }, { status: 500 });
  }

  return NextResponse.json(userData as User, { status: 201 });
}

type PatchUserInput = {
  onboardingDismissed?: boolean;
  onboardingPipelineExplored?: boolean;
  onboardingReportViewed?: boolean;
};

export async function PATCH(
  req: NextRequest,
): Promise<NextResponse<{ ok: boolean } | { error: string }>> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  // id is always the Clerk user ID — POST /api/user sets it explicitly on create
  const body = (await req.json()) as PatchUserInput;
  const update: Partial<PatchUserInput> = {};

  if (typeof body.onboardingDismissed === "boolean") {
    update.onboardingDismissed = body.onboardingDismissed;
  }
  if (typeof body.onboardingPipelineExplored === "boolean") {
    update.onboardingPipelineExplored = body.onboardingPipelineExplored;
  }
  if (typeof body.onboardingReportViewed === "boolean") {
    update.onboardingReportViewed = body.onboardingReportViewed;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Inga fält att uppdatera." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({ where: { id: clerkUser.id }, data: update });
  } catch (err) {
    logger.error("Failed to update onboarding flags", { userId: clerkUser.id });
    Sentry.captureException(err, { tags: { route: "PATCH /api/user" } });
    return NextResponse.json(
      { error: "Det gick inte att uppdatera profilen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
