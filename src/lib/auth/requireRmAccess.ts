import { notFound } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth/current-db-user";
import { hasRmAccess } from "@/lib/rm-access";

export async function requireRmAccess() {
  const user = await getCurrentDbUser({
    id: true,
    email: true,
    name: true,
    role: true,
    rmOrganizationId: true,
  });

  if (!hasRmAccess(user)) {
    notFound();
  }

  return user;
}