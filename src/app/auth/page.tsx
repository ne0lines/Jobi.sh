import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthPageClient } from "@/components/auth/auth-page-client";
import { AUTH_COOKIE_NAME, verifySessionValue } from "@/server/auth-session";

export default async function AuthPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ next?: string | string[] }>;
}>) {
  const cookieStore = await cookies();
  const userId = await verifySessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (userId) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const nextValue = resolvedSearchParams.next;
  const initialNextPath = Array.isArray(nextValue) ? nextValue[0] : nextValue;

  return <AuthPageClient initialNextPath={initialNextPath || "/"} />;
}