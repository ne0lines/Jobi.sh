import { UserRole } from "@/app/generated/prisma/enums";
import { TERMS_VERSION } from "@/lib/legal";
import prisma from "@/lib/prisma";
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
};

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

  const dbData = await prisma.user.findUnique({
    where: { email },
    select: {
      complete: true,
      email: true,
      id: true,
      name: true,
      profession: true,
      role: true,
      termsAcceptedAt: true,
      termsVersion: true,
    },
  });

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

  const userData = await prisma.user.create({
    data: {
      id: clerkUser.id,
      email,
      name,
      profession,
      complete: true,
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
    },
    select: {
      complete: true,
      email: true,
      id: true,
      name: true,
      profession: true,
      role: true,
      termsAcceptedAt: true,
      termsVersion: true,
    },
  });

  return NextResponse.json(userData as User, { status: 201 });
}
