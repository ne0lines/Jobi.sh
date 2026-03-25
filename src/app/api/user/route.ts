import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/app/generated/prisma/enums";

type User = {
  complete: boolean;
  email: string;
  name: string;
  profession: string;
  role: UserRole;
  id: string;
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
  });

  if (!dbData) {
    return NextResponse.redirect(new URL("/konto/create-profile", req.url));
  }

  const { createdAt, updatedAt, ...userData } = dbData;

  return NextResponse.json(userData as User);
}

type CreateProfileInput = {
  name: string;
  profession: string;
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

  const { name, profession } = (await req.json()) as CreateProfileInput;

  if (!name || !profession) {
    return NextResponse.json(
      { error: "Namn och yrke måste anges." },
      { status: 400 },
    );
  }

  const { createdAt, updatedAt, ...userData } = await prisma.user.create({
    data: {
      id: clerkUser.id,
      email,
      name,
      profession,
      complete: true,
    },
  });

  return NextResponse.json(userData as User, { status: 201 });
}
