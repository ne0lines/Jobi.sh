import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutBtn } from "@/components/auth/logout-btn";
import { AUTH_COOKIE_NAME, getUserIdFromHeaders, verifySessionValue } from "@/server/auth-session";
import { getUserById } from "@/server/users";

export default async function AccountPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const userId = getUserIdFromHeaders(headerList) ?? (await verifySessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value));

  if (!userId) {
    redirect("/auth");
  }

  const currentUser = await getUserById(userId);

  if (!currentUser) {
    redirect("/auth");
  }

  return (
    <main className="min-h-svh px-4 pt-4">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 md:max-w-none">
        <div>
          <h1 className="font-display text-4xl md:text-[2.4rem]">Konto</h1>
        </div>

        <article className="rounded-3xl border border-app-stroke bg-app-card p-5">
          <h2 className="font-display text-2xl">Kontoinformation</h2>
          <dl className="mt-4 space-y-3 text-base text-app-ink">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-app-muted">E-postadress</dt>
              <dd className="mt-1">{currentUser.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-app-muted">Användar-ID</dt>
              <dd className="mt-1 break-all">{currentUser.id}</dd>
            </div>
          </dl>
        </article>

        <LogoutBtn className="w-full md:hidden" />
      </section>
    </main>
  );
}