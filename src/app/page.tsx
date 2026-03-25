import { Btn } from "@/components/ui/btn";
import { LogoutBtn } from "@/components/auth/logout-btn";
import { Pipeline, Statistics } from "@/components/dashboard";

export default async function Home() {
  return (
    <main className="min-h-svh px-4 md:px-0">
      <div className="w-full rounded-3xl">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-4xl leading-none md:hidden">Jobi<span className="text-app-primary">.sh</span></h1>
            <Btn className="md:hidden" href="/jobb/new" icon={Plus}>Lägg till jobb</Btn>
          </div>
        </section>
        <Statistics applications={[]} />
        <Pipeline jobs={[]} />
        <Btn
          href="/report"
          className="mt-5 w-full"
          icon="/ams-logo.svg"
          hex="#00005A"
        >
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
