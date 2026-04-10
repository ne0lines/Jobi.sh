"use client";

import type { ReportJobEntry } from "@/app/report/report-page-data";
import { Btn } from "@/components/ui/btn";
import Link from "next/link";

type AppliedJobsPageClientProps = {
  jobs: ReportJobEntry[];
};

export function AppliedJobsPageClient({ jobs }: Readonly<AppliedJobsPageClientProps>) {
  if (jobs.length === 0) {
    return (
      <main className="min-h-svh pt-4">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Sökta jobb</h1>
          <p className="text-lg text-app-muted">
            Det finns inga registrerade ansökningar att visa ännu.
          </p>
          <Btn href="/dashboard" variant="secondary" track="back_click">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page">
      <section className="mx-auto app-page-content-compact w-full max-w-3xl md:max-w-none">
        <div className="app-heading-stack-tight">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Sökta jobb</h1>
          <p className="text-lg text-app-muted">
            Här ser du alla jobb du har sökt, sorterade efter senaste ansökningsdatum.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobb/${job.id}`}
              className="app-card-dense transition hover:-translate-y-0.5 hover:border-app-primary/35 hover:shadow-sm"
            >
              <div className="app-card-stack">
                <div className="flex items-center justify-between gap-4">
                  <strong className="font-display text-left text-base font-bold transition truncate hover:text-app-primary">
                    {job.title}
                  </strong>
                  <p className="shrink-0 text-sm text-app-muted text-right">{job.applicationDate}</p>
                </div>

                <p className="block text-left text-app-muted transition hover:text-app-primary">
                  {job.company}
                </p>

                <div className="flex items-start justify-between gap-4 text-sm text-app-muted">
                  <p className="min-w-0">
                    <strong className="text-app-ink">Plats:</strong> {job.location}
                  </p>
                  <p className="shrink-0 text-right">
                    <strong className="text-app-ink">Omfattning:</strong> {job.workload}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}