import { JobStatus, type Db } from "@/app/types";
import Board from "./board";

export default async function Pipeline() {
  const res = await fetch("http:localhost:3000/api/jobs");

  if (!res.ok) return <p>No applications yet!</p>;

  const { applications: jobs } = (await res.json()) as Db;

  const saved = jobs.filter((j) => j.status === JobStatus.SAVED);
  const applied = jobs.filter((j) => j.status === JobStatus.APPLIED);
  const interviewed = jobs.filter((j) => j.status === JobStatus.INTERVIEW);
  const inProcess = jobs.filter((j) => j.status === JobStatus.IN_PROCESS);
  const offers = jobs.filter((j) => j.status === JobStatus.OFFER);
  const closed = jobs.filter((j) => j.status === JobStatus.CLOSED);

  return (
    <section className="w-full">
      <h2 className="mt-6 mb-3 font-display text-4xl">Pipeline</h2>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <Board jobs={saved} label={"Sparat"} />

        <Board
          jobs={applied}
          label={"Ansökt"}
          borderColor="border-blue-400"
          bgColor="bg-blue-100"
        />

        <Board
          jobs={inProcess}
          label={"Pågår"}
          borderColor="border-amber-400"
          bgColor="bg-amber-100"
        />

        <Board
          jobs={interviewed}
          label={"Intervju"}
          borderColor="border-cyan-400"
          bgColor="bg-cyan-100"
        />

        <Board
          jobs={offers}
          label={"Erbjudande"}
          borderColor="border-green-400"
          bgColor="bg-green-100"
        />

        <Board
          jobs={closed}
          label={"Avslutad"}
          borderColor="border-red-400"
          bgColor="bg-red-100"
        />
      </div>

      <article className="mt-3 rounded-2xl border border-app-stroke bg-app-card p-4">
        <h3 className="mb-2 text-xl font-display">Påminnelse</h3>
        <p className="text-base text-app-muted">
          Ingen återkoppling från PixelForge efter 7 dagar. Följ upp idag.
        </p>
      </article>
    </section>
  );
}
