import { Btn } from "@/components/ui/btn";
import { Pipeline, Statistics } from "@/components/dashboard";

export default async function Home() {
  const res = await fetch('http://localhost:3000/api/jobs');
  const data = await res.json();
  const applications = data.applications;

  return (
    <main className="container mx-auto grid min-h-screen place-items-center p-4 sm:p-5">
      <section className="rounded-3xl border border-app-stroke bg-app-surface p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="grid">
            <span className="font-display text-5xl leading-none sm:text-6xl">
              ApplyTrack{" "}
            </span>
            <span className="mt-2 text-lg text-app-muted font-normal">
              Översikt över sökta jobb
            </span>
          </h1>
          <Btn href="/jobb/new">Lägg till jobb</Btn>
        </div>
        <Pipeline />

        <Statistics applications={applications} />
      </section>
    </main>
  );
}
