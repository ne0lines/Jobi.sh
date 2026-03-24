import { Btn } from "@/components/ui/btn";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { Pipeline, Statistics } from "@/components/dashboard";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getApplicationsForUser, readDbForUser } from "@/server/db";
import { AUTH_COOKIE_NAME, getUserIdFromHeaders, verifySessionValue } from "@/server/auth-session";
import { getUserById } from "@/server/users";

export default async function Home() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const userId = getUserIdFromHeaders(headerList) ?? (await verifySessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value));

  if (!userId) {
    redirect("/auth");
  }

  const data = userId ? await readDbForUser(userId) : { applications: [] };
  const applications = userId ? getApplicationsForUser(data.applications, userId) : [];
  const currentUser = userId ? await getUserById(userId) : null;

  if (!currentUser) {
    redirect("/auth");
  }

  if (applications.length === 0) {
    redirect("/jobb/new");
  }

  return (
    <main className="min-h-screen px-4">
      <div className="w-full rounded-3xl">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-4xl leading-none">Jobi<span className="text-app-primary">.sh</span></h1>
            <Btn href="/jobb/new" icon="/MaterialSymbolsAdd.svg" iconHex="#FFFFFF">Lägg till jobb</Btn>
          </div>
        </section>
        <Pipeline jobs={applications} />
        <Statistics applications={applications} />
        <Btn href="/report" className="mt-5 w-full" icon="/ams-logo.svg" hex="#00005A">
          Aktivitetsrapportera
        </Btn>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Btn href="/konto" variant="secondary" className="w-full">
            Konto
          </Btn>
          <LogoutBtn className="w-full" />
        </div>
      </div>
    </main>
  );
}
