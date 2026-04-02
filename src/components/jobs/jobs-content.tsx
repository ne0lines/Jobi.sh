"use client";

import { useJobs } from "@/lib/hooks/jobs";
import { Btn } from "@/components/ui/btn";
import { DeleteJobBtn } from "@/components/jobs/delete-job-btn";
import { Plus } from "lucide-react";
import Link from "next/link";

export function JobsContent() {
  const { data: jobs = [] } = useJobs();

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl sm:text-6xl">Jobb</h1>
        <Btn href="/jobb/new" icon={Plus} track="add_job_click">Lägg till</Btn>
      </div>

      {jobs.length === 0 ? (
        <p className="text-base text-app-muted">Inga jobb sparade än.</p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.id} className="relative rounded-2xl border border-app-stroke bg-app-card transition hover:-translate-y-0.5 hover:shadow-sm">
              <Link href={`/jobb/${job.id}`}>
                <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                <span className="sr-only">Läs mer om {job.title}</span>
              </Link>
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <strong className="block truncate text-base leading-snug text-app-ink sm:text-lg">
                    {job.title}
                  </strong>
                  <span className="mt-0.5 block truncate text-sm text-app-muted sm:text-base">
                    {job.company}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-app-surface px-3 py-1 text-sm text-app-muted">
                    {job.status}
                  </span>
                  <DeleteJobBtn jobId={job.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
