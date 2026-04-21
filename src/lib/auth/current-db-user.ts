import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/app/generated/prisma/client";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

type ClerkIdentity = {
  clerkUserId: string;
  email: string | null;
};

type SelectedUser<T extends Prisma.UserSelect> = Prisma.UserGetPayload<{ select: T }>;

function getEmailFromSessionClaims(sessionClaims: unknown): string | null {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return null;
  }

  const claims = sessionClaims as Record<string, unknown>;
  const emailCandidate =
    claims.email ??
    claims.email_address ??
    claims.primary_email_address;

  return typeof emailCandidate === "string" && emailCandidate.trim().length > 0
    ? emailCandidate
    : null;
}

async function backfillExternalId(dbUserId: string, clerkUserId: string, existingExternalId: string | null) {
  if (existingExternalId !== null) {
    return;
  }

  try {
    await prisma.user.update({
      where: { id: dbUserId },
      data: { externalId: clerkUserId },
    });
  } catch (error) {
    logger.warn("Failed to backfill Clerk externalId on user", {
      clerkUserId,
      dbUserId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function resolveDbUserId(identity: ClerkIdentity): Promise<string | null> {
  const userByExternalId = await prisma.user.findUnique({
    where: { externalId: identity.clerkUserId },
    select: { id: true },
  });

  if (userByExternalId) {
    return userByExternalId.id;
  }

  const userByLegacyId = await prisma.user.findUnique({
    where: { id: identity.clerkUserId },
    select: {
      id: true,
      externalId: true,
    },
  });

  if (userByLegacyId) {
    await backfillExternalId(
      userByLegacyId.id,
      identity.clerkUserId,
      userByLegacyId.externalId,
    );
    return userByLegacyId.id;
  }

  if (!identity.email) {
    return null;
  }

  const userByEmail = await prisma.user.findFirst({
    where: {
      email: {
        equals: identity.email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      externalId: true,
    },
  });

  if (!userByEmail) {
    return null;
  }

  await backfillExternalId(
    userByEmail.id,
    identity.clerkUserId,
    userByEmail.externalId,
  );
  return userByEmail.id;
}

export async function getCurrentClerkIdentity(): Promise<ClerkIdentity | null> {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    return null;
  }

  return {
    clerkUserId: userId,
    email: getEmailFromSessionClaims(sessionClaims),
  };
}

export async function findDbUserByClerkIdentity<T extends Prisma.UserSelect>(
  identity: ClerkIdentity,
  select: T,
): Promise<SelectedUser<T> | null> {
  const dbUserId = await resolveDbUserId(identity);

  if (!dbUserId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: dbUserId },
    select,
  }) as Promise<SelectedUser<T> | null>;
}

export async function getCurrentDbUser<T extends Prisma.UserSelect>(
  select: T,
): Promise<SelectedUser<T> | null> {
  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    return null;
  }

  return findDbUserByClerkIdentity(identity, select);
}