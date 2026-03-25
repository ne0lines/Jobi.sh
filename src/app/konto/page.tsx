import { Btn } from "@/components/ui/btn";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <main className="min-h-svh px-4 pt-4">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 md:max-w-none">
        <div>
          <h1 className="font-display text-4xl sm:text-6xl">Konto</h1>
          <p className="mt-3 text-base text-app-muted sm:text-lg">
            Inloggad med {email}
          </p>
        </div>

        <article className="rounded-3xl border border-app-stroke bg-app-card p-5">
          <h2 className="font-display text-2xl">Kontoinformation</h2>
          <dl className="mt-4 space-y-3 text-base text-app-ink">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-app-muted">E-postadress</dt>
              <dd className="mt-1">{email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-app-muted">Användar-ID</dt>
              <dd className="mt-1 break-all">{user.id}</dd>
            </div>
          </dl>
        </article>

        <LogoutBtn className="w-full md:hidden" />
      </section>
    </main>
  );
}
