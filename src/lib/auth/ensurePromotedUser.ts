import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Lazily promotes a Clerk-dev user to their new Clerk-prod id on first authed
// request. Idempotent: after promotion the fast path is a single indexed lookup.
// Returns the Clerk user id for the caller's convenience, or null if unauthed.
export async function ensurePromotedUser(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const externalId = clerkUser?.externalId ?? null;
  if (!externalId) return userId;

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (current) return userId;

  const legacy = await prisma.user.findUnique({
    where: { id: externalId },
    select: { id: true },
  });
  if (!legacy) return userId;

  try {
    await prisma.user.update({
      where: { id: externalId },
      data: { id: userId, externalId },
    });
  } catch (err) {
    // A concurrent request promoted the same row; P2025 = record not found.
    if (!(err instanceof Error && err.message.includes("P2025"))) throw err;
  }
  return userId;
}
