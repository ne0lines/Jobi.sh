"use client";

import type { Job } from "@/app/types";
import { JobStatus } from "@/app/types";
import { useJobs } from "@/lib/hooks/jobs";
import { Btn } from "@/components/ui/btn";
import { ArchiveJobBtn } from "@/components/jobs/archive-job-btn";
import { DeleteJobBtn } from "@/components/jobs/delete-job-btn";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

function JobList({ jobs, showArchivedBadge = false, statusLabel, archivedLabel }: Readonly<{
  jobs: Job[];
  showArchivedBadge?: boolean;
  statusLabel: Record<string, string>;
  archivedLabel: string;
}>) {
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.id} className="relative app-card-dense transition hover:-translate-y-0.5 hover:shadow-sm">
          <Link href={`/jobs/${job.id}`}>
            <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 app-card-stack">
              <strong className="block truncate text-base leading-snug text-app-ink sm:text-lg">
                {job.title}
              </strong>
              <span className="block truncate text-sm text-app-muted sm:text-base">
                {job.company}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {showArchivedBadge ? (
                <span className="rounded-full bg-app-muted-surface px-3 py-1 text-sm text-app-muted-ink">
                  {archivedLabel}
                </span>
              ) : null}
              <span className="rounded-full bg-app-surface px-3 py-1 text-sm text-app-muted">
                {statusLabel[job.status] ?? job.status}
              </span>
              <ArchiveJobBtn jobId={job.id} archivedAt={job.archivedAt} />
              <DeleteJobBtn jobId={job.id} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function JobsContent() {
  const { data: jobs = [] } = useJobs({ includeArchived: true });
  const t = useTranslations("jobs");
  const tStatus = useTranslations("status");

  const statusLabel: Record<string, string> = {
    [JobStatus.SAVED]: tStatus("saved"),
    [JobStatus.APPLIED]: tStatus("applied"),
    [JobStatus.IN_PROCESS]: tStatus("inProcess"),
    [JobStatus.INTERVIEW]: tStatus("interview"),
    [JobStatus.OFFER]: tStatus("offer"),
    [JobStatus.CLOSED]: tStatus("closed"),
  };

  const activeJobs = jobs.filter((job) => !job.archivedAt);
  const archivedJobs = jobs.filter((job) => job.archivedAt);

  return (
    <section className="app-page-content-compact">
      <div className="flex items-start justify-between gap-3">
        <div className="app-heading-stack-tight">
          <h1 className="font-display text-4xl sm:text-6xl">{t("title")}</h1>
        </div>
        <Btn href="/jobs/new" icon={Plus} track="add_job_click">{t("addBtn")}</Btn>
      </div>

      {jobs.length === 0 ? <p className="text-base text-app-muted">{t("empty")}</p> : null}

      {activeJobs.length > 0 ? (
        <section className="space-y-3">
          <JobList jobs={activeJobs} statusLabel={statusLabel} archivedLabel="" />
        </section>
      ) : null}

      {archivedJobs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl">{t("archivedTitle")}</h2>
          <JobList jobs={archivedJobs} showArchivedBadge statusLabel={statusLabel} archivedLabel={t("archivedBadge")} />
        </section>
      ) : null}
    </section>
  );
}
