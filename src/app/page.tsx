import { Btn } from "@/components/ui/btn";
import { Pipeline, Statistics } from "@/components/dashboard";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/jobs", {
    cache: "no-store",
  });
  const data = await res.json();
  const applications = data.applications;

  return (
    <main className="min-h-screen p-4 pt-0">
      <div className="w-full rounded-3xl">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="grid">
              <span className="font-display text-4xl leading-none sm:text-6xl">
                ApplyTrack{" "}
              </span>
              <span className="mt-2 text-base font-normal text-app-muted sm:text-lg">
                Översikt över sökta jobb
              </span>
            </h1>
            <Btn href="/jobb/new" icon="/MaterialSymbolsAdd.svg" iconHex="#FFFFFF">Lägg till jobb</Btn>
          </div>
        </section>
        <Pipeline />
        <Statistics applications={applications} />
        <Btn href="/report" className="mt-5 w-full" icon="/ams-logo.svg" hex="#00005A">
          Aktivitetsrapportera
        </Btn>
      </div>
    </main>
  );
}
