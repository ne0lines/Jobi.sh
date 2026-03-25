import { Job, JobStatus } from "@/app/types";
import Link from "next/link";
import Board from "./board";

type TodoItem = {
  dueAt: number;
  id: string;
  jobId: string;
  text: string;
};

const monthMap: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  mars: 2,
  apr: 3,
  april: 3,
  maj: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augusti: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseSwedishDate(value: string): Date | null {
  const trimmedValue = value.trim().toLowerCase();
  const match = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthToken = match[2].replace(".", "");
  const year = Number(match[3]);
  const month = monthMap[monthToken];

  if (month === undefined) {
    return null;
  }

  return new Date(year, month, day);
}

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function findTimelineDate(job: Job, matcher: (event: string) => boolean): Date | null {
  const match = [...job.timeline]
    .reverse()
    .find((item) => matcher(item.event.toLowerCase()));

  return match ? parseSwedishDate(match.date) : null;
}

function getSavedDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("sparat"));
}

function getAppliedDate(job: Job): Date | null {
  return findTimelineDate(job, (event) => event.includes("ansökan skickad"));
}

function getInterviewDate(job: Job): Date | null {
  const interviewDate = findTimelineDate(job, (event) => event.includes("intervju"));

  if (interviewDate) {
    return interviewDate;
  }

  return getAppliedDate(job);
}

function getTodoItems(jobs: Job[]): TodoItem[] {
  const now = new Date();

  return jobs
    .flatMap((job): TodoItem[] => {
      if (job.status === JobStatus.SAVED) {
        const savedDate = getSavedDate(job);

        if (!savedDate) {
          return [];
        }

        const dueDate = addDays(savedDate, 3);

        return [
          {
            dueAt: dueDate.getTime(),
            id: `${job.id}-saved`,
            jobId: job.id,
            text:
              dueDate < now
                ? `Skicka ansökan till ${job.company} för ${job.title} så snart som möjligt. Den borde ha skickats senast ${formatDueDate(dueDate)}.`
                : `Skicka ansökan till ${job.company} för ${job.title} senast ${formatDueDate(dueDate)}.`,
          },
        ];
      }

      if (job.status === JobStatus.APPLIED) {
        const appliedDate = getAppliedDate(job);

        if (!appliedDate) {
          return [];
        }

        const followUpDate = addDays(appliedDate, 14);

        if (followUpDate > now) {
          return [];
        }

        return [
          {
            dueAt: followUpDate.getTime(),
            id: `${job.id}-applied`,
            jobId: job.id,
            text: `Följ upp ansökan hos ${job.company} för ${job.title}. Det har gått 14 dagar sedan du skickade ansökan.`,
          },
        ];
      }

      if (job.status === JobStatus.INTERVIEW) {
        const interviewDate = getInterviewDate(job);

        if (!interviewDate) {
          return [];
        }

        const contactDate = addDays(interviewDate, 7);

        if (contactDate > now) {
          return [];
        }

        return [
          {
            dueAt: contactDate.getTime(),
            id: `${job.id}-interview`,
            jobId: job.id,
            text: `Kontakta ${job.company} om ${job.title}. Det har gått 7 dagar sedan intervjun utan svar.`,
          },
        ];
      }

      return [];
    })
    .sort((firstItem, secondItem) => firstItem.dueAt - secondItem.dueAt);
}

export default function Pipeline({ jobs }: Readonly<{ jobs: Job[] }>) {
  if (jobs.length === 0) return <p>No applications yet!</p>;

  const saved = jobs.filter((j) => j.status === JobStatus.SAVED);
  const applied = jobs.filter((j) => j.status === JobStatus.APPLIED);
  const interviewed = jobs.filter((j) => j.status === JobStatus.INTERVIEW);
  const inProcess = jobs.filter((j) => j.status === JobStatus.IN_PROCESS);
  const offers = jobs.filter((j) => j.status === JobStatus.OFFER);
  const todoItems = getTodoItems(jobs);

  return (
    <section className="w-full">
      <article className="mt-4 rounded-2xl border border-app-stroke bg-app-card p-4">
        <h3 className="mb-2 text-xl font-display">Att göra</h3>
        {todoItems.length > 0 ? (
          <div className="divide-y divide-app-stroke text-base text-app-muted">
            {todoItems.map((item) => (
              <Link
                key={item.id}
                href={`/jobb/${item.jobId}`}
                className="block py-3 transition first:pt-0 last:pb-0 hover:text-app-primary"
              >
                {item.text}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-base text-app-muted">
            Inget att följa upp just nu.
          </p>
        )}
      </article>
      <h2 className="mt-6 mb-3 font-display text-3xl md:text-[1.75rem]">Pipeline</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {applied.length > 0 && (
          <Board
            jobs={applied}
            label={"Ansökt"}
            borderColor="border-blue-400"
            bgColor="bg-blue-100"
          />
        )}

        {inProcess.length > 0 && (
          <Board
            jobs={inProcess}
            label={"Pågår"}
            borderColor="border-amber-400"
            bgColor="bg-amber-100"
          />
        )}

        {interviewed.length > 0 && (
          <Board
            jobs={interviewed}
            label={"Intervju"}
            borderColor="border-cyan-400"
            bgColor="bg-cyan-100"
          />
        )}
        {offers.length > 0 && (
          <Board
            jobs={offers}
            label={"Erbjudande"}
            borderColor="border-green-400"
            bgColor="bg-green-100"
          />
        )}
        {saved.length > 0 && <Board jobs={saved} label={"Sparat"} />}
      </div>
    </section>
  );
}
