import { ColorScheme, UserRole } from "@/app/generated/prisma/enums";
import {
  findDbUserByClerkIdentity,
  getCurrentClerkIdentity,
  getCurrentDbUser,
} from "@/lib/auth/current-db-user";
import { TERMS_VERSION } from "@/lib/legal";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { syncRmInvitationsForRegisteredUser } from "@/lib/rm";
import * as Sentry from "@sentry/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type User = {
  complete: boolean;
  email: string;
  name: string;
  profession: string;
  role: UserRole;
  rmOrganizationId: string | null;
  id: string;
  termsAcceptedAt: Date | null;
  termsVersion: string | null;
  onboardingDismissed: boolean;
  onboardingPipelineExplored: boolean;
  onboardingReportViewed: boolean;
  colorScheme: ColorScheme;
};

const userSelect = {
  complete: true,
  email: true,
  id: true,
  name: true,
  profession: true,
  role: true,
  rmOrganizationId: true,
  termsAcceptedAt: true,
  termsVersion: true,
  onboardingDismissed: true,
  onboardingPipelineExplored: true,
  onboardingReportViewed: true,
  colorScheme: true,
} as const;

const PROFILE_TEXT_MAX_LENGTH = 120;
const PROFILE_TEXT_PATTERN = /^[\p{L}\p{M}\p{N} .,'’\-()/&+]+$/u;

function normalizeProfileText(value: string | undefined): string {
  return value?.normalize("NFC").trim().replaceAll(/\s+/g, " ") ?? "";
}

function getProfileTextError(label: string, value: string): string | null {
  if (!value) {
    return `${label} måste anges.`;
  }

  if (value.length > PROFILE_TEXT_MAX_LENGTH) {
    return `${label} får vara högst ${PROFILE_TEXT_MAX_LENGTH} tecken.`;
  }

  if (!PROFILE_TEXT_PATTERN.test(value)) {
    return `${label} får innehålla bokstäver som å, ä och ö samt vanliga namn- och yrkesrollstecken.`;
  }

  return null;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  let dbData;
  try {
    dbData = await findDbUserByClerkIdentity(
      identity,
      userSelect,
    );
  } catch (err) {
    logger.error("Failed to fetch user profile", { userId: identity.clerkUserId });
    Sentry.captureException(err, { tags: { route: "GET /api/user" } });
    return NextResponse.json(
      { error: "Det gick inte att hämta profilen." },
      { status: 500 },
    );
  }

  if (!dbData) {
    return NextResponse.json(
      { error: "Skapa din profil innan du fortsätter." },
      { status: 404 },
    );
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const identity = await getCurrentClerkIdentity();
  let email = identity?.email ?? null;

  if (!email) {
    const clerkUser = await currentUser();
    email = clerkUser?.emailAddresses[0]?.emailAddress ?? null;
  }

  if (!email) {
    return NextResponse.json(
      { error: "Ingen e-postadress hittades." },
      { status: 400 },
    );
  }

  const { name, profession, termsAccepted, termsVersion } =
    (await req.json()) as CreateProfileInput;
  const normalizedName = normalizeProfileText(name);
  const normalizedProfession = normalizeProfileText(profession);

  if (!normalizedName || !normalizedProfession) {
    return NextResponse.json(
      { error: "Namn och yrke måste anges." },
      { status: 400 },
    );
  }

  const nameError = getProfileTextError("Namn", normalizedName);

  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  const professionError = getProfileTextError("Yrkesroll", normalizedProfession);

  if (professionError) {
    return NextResponse.json({ error: professionError }, { status: 400 });
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
        email,
        externalId: userId,
        name: normalizedName,
        profession: normalizedProfession,
        complete: true,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
      update: {
        externalId: userId,
        name: normalizedName,
        profession: normalizedProfession,
        complete: true,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
      select: userSelect,
    });
  } catch (err) {
    logger.error("Failed to upsert user profile", { userId });
    Sentry.captureException(err, { tags: { route: "POST /api/user" } });
    return NextResponse.json(
      { error: "Det gick inte att spara profilen." },
      { status: 500 },
    );
  }

  try {
    await syncRmInvitationsForRegisteredUser({
      email: userData.email,
      id: userData.id,
      name: userData.name,
    });
  } catch (err) {
    logger.warn("Failed to sync RM invitations after profile creation", {
      userId: userData.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json(userData as User, { status: 201 });
}

type PatchUserInput = {
  name?: string;
  email?: string;
  profession?: string;
  onboardingDismissed?: boolean;
  onboardingPipelineExplored?: boolean;
  onboardingReportViewed?: boolean;
  colorScheme?: ColorScheme;
};

export async function PATCH(
  req: NextRequest,
): Promise<NextResponse<User | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const body = (await req.json()) as PatchUserInput;
  const update: Partial<PatchUserInput> = {};

  if (body.name !== undefined) {
    const normalizedName = normalizeProfileText(body.name);
    const nameError = getProfileTextError("Namn", normalizedName);

    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    update.name = normalizedName;
  }
  if (body.profession !== undefined) {
    const normalizedProfession = normalizeProfileText(body.profession);
    const professionError = getProfileTextError("Yrkesroll", normalizedProfession);

    if (professionError) {
      return NextResponse.json({ error: professionError }, { status: 400 });
    }

    update.profession = normalizedProfession;
  }
  if (body.email !== undefined) update.email = body.email;
  if (body.onboardingDismissed !== undefined) {
    update.onboardingDismissed = body.onboardingDismissed;
  }
  if (body.onboardingPipelineExplored !== undefined) {
    update.onboardingPipelineExplored = body.onboardingPipelineExplored;
  }
  if (body.onboardingReportViewed !== undefined) {
    update.onboardingReportViewed = body.onboardingReportViewed;
  }
  if (
    body.colorScheme === ColorScheme.dark ||
    body.colorScheme === ColorScheme.light
  ) {
    update.colorScheme = body.colorScheme;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Inga fält att uppdatera." },
      { status: 400 },
    );
  }

  const dbUser = await getCurrentDbUser({ id: true });

  if (!dbUser) {
    return NextResponse.json(
      { error: "Skapa din profil innan du uppdaterar den." },
      { status: 404 },
    );
  }

  let data;
  try {
    data = await prisma.user.update({
      where: { id: dbUser.id },
      data: update,
      select: userSelect,
    });
  } catch (err) {
    logger.error("Failed to update user preferences", { userId });
    Sentry.captureException(err, { tags: { route: "PATCH /api/user" } });
    return NextResponse.json(
      { error: "Det gick inte att uppdatera profilen." },
      { status: 500 },
    );
  }

  return NextResponse.json(data as User, { status: 200 });
}
