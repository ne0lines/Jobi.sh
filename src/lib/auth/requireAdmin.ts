import { notFound } from "next/navigation";
import { UserRole } from "@/app/generated/prisma/enums";
import { getCurrentDbUser } from "@/lib/auth/current-db-user";

export async function requireAdmin() {
  const user = await getCurrentDbUser({ id: true, role: true });
  if (user?.role !== UserRole.admin) notFound();

  return user;
}
