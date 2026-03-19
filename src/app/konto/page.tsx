import { Btn } from "@/components/ui/btn";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen p-4 pt-0">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-6xl">Konto</h1>
          <p className="mt-3 text-base text-app-muted sm:text-lg">
            Inloggad med {currentUser.email}
          </p>
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

        <div className="grid grid-cols-2 gap-3">
          <Btn href="/" variant="secondary" className="w-full">
            Tillbaka
          </Btn>
          <LogoutBtn className="w-full" />
        </div>
      </section>
    </main>
  );
}