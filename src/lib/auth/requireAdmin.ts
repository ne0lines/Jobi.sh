import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma/enums";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) notFound();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== UserRole.admin) notFound();

  return user;
}
