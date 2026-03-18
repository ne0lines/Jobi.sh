import { JobStatus, type Db } from "@/app/types";
import Board from "./board";

export default async function Pipeline() {
  const res = await fetch("http:localhost:3000/api/jobs");

  if (!res.ok) return <p>No applications yet!</p>;

  const { applications: jobs } = (await res.json()) as Db;

  const saved = jobs.filter((j) => j.status === JobStatus.SAVED);
  const applied = jobs.filter((j) => j.status === JobStatus.APPLIED);
  const interviewed = jobs.filter((j) => j.status === JobStatus.INTERVIEW);

  return (
    <section>
      <h2 className="mt-6 mb-3 font-display text-4xl">Pipeline</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Board jobs={saved} label={"Sparat"} />

        <Board
          jobs={interviewed}
          label={"Intervju"}
          borderColor="border-cyan-400"
          bgColor="bg-cyan-100"
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
