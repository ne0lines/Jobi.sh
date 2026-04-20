"use client";

import { Job, JobStatus } from "@/app/types";
import { useLocale, useTranslations } from "next-intl";
import { getTodoItems, type TodoItem } from "@/lib/job-insights";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Board from "./board";

const todoStateClassNames: Record<TodoItem["state"], string> = {
  overdue:
    "bg-app-blush text-app-red-strong dark:bg-[#3d2823] dark:text-[#ff9395]",
  today: "bg-app-sand text-[#7a4b00] dark:bg-[#3a2a0f] dark:text-[#ffd38a]",
  soon: "bg-app-cyan text-app-cyan-strong dark:bg-[#123348] dark:text-[#8edcff]",
  upcoming: "bg-blue-100 text-[#295a99] dark:bg-[#123348] dark:text-[#9bc2ff]",
};

export default function Pipeline({ jobs }: Readonly<{ jobs: Job[] }>) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("status");
  const locale = useLocale();

  const todoStateLabels: Record<TodoItem["state"], string> = {
    overdue: t("todoStateOverdue"),
    today: t("todoStateToday"),
    soon: t("todoStateSoon"),
    upcoming: t("todoStateUpcoming"),
  };

  const todoKindLabels: Record<TodoItem["kind"], string> = {
    apply: t("todoKindApply"),
    deadline: t("todoKindDeadline"),
    followUp: t("todoKindFollowUp"),
    checkIn: t("todoKindCheckIn"),
    decision: t("todoKindDecision"),
  };

  const jobStatusLabels: Record<JobStatus, string> = {
    [JobStatus.SAVED]: tStatus("saved"),
    [JobStatus.APPLIED]: tStatus("applied"),
    [JobStatus.IN_PROCESS]: tStatus("inProcess"),
    [JobStatus.INTERVIEW]: tStatus("interview"),
    [JobStatus.OFFER]: tStatus("offer"),
    [JobStatus.CLOSED]: tStatus("closed"),
  };

  if (jobs.length === 0) {
    return (
      <section className="app-page-content w-full py-6">
        <article className="overflow-hidden">
          <div className="app-page-content-compact">
            <div>
              <h2 className="font-display text-3xl leading-tight md:text-[2rem]">
                {t("emptyHeadline")}
              </h2>
              <p className="mt-3 text-base text-app-muted sm:text-lg">
                {t("emptyDescription")}
              </p>
            </div>
          </div>
        </article>
      </section>
    );
  }

  const saved = jobs.filter((j) => j.status === JobStatus.SAVED);
  const applied = jobs.filter((j) => j.status === JobStatus.APPLIED);
  const interviewed = jobs.filter((j) => j.status === JobStatus.INTERVIEW);
  const inProcess = jobs.filter((j) => j.status === JobStatus.IN_PROCESS);
  const offers = jobs.filter((j) => j.status === JobStatus.OFFER);
  const todoItems = getTodoItems(jobs, { locale, t });

  return (
    <section className="w-full flex flex-col gap-8">
      <article>
        {todoItems.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-display text-3xl md:text-[1.75rem]">{t("todo")}</h3>
            {todoItems.map((item) => (
              <Link
                key={item.id}
                href={`/jobs/${item.jobId}`}
                className="block rounded-2xl border border-app-stroke bg-app-surface p-4 transition hover:-translate-y-0.5 hover:border-app-primary/30 hover:shadow-sm dark:bg-white/5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          todoStateClassNames[item.state],
                        )}
                      >
                        {todoStateLabels[item.state]}
                      </span>
                      <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-app-muted dark:bg-white/10">
                        {todoKindLabels[item.kind]}
                      </span>
                      <span className="rounded-full bg-app-card px-3 py-1 text-xs font-semibold text-app-muted dark:bg-white/8">
                        {jobStatusLabels[item.status]}
                      </span>
                    </div>
                    <strong className="mt-3 block text-base leading-snug text-app-ink sm:text-lg">
                      {item.title}
                    </strong>
                    <p className="mt-1 text-sm leading-6 text-app-muted sm:text-base">
                      {item.text}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-app-card px-3 py-1 text-sm font-medium text-app-muted dark:bg-white/8">
                    {item.dueLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-base text-app-muted">
            {t("todoEmpty")}
          </p>
        )}
      </article>
      <h2 className="font-display -mb-6 text-3xl md:text-[1.75rem]">{t("pipeline")}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {applied.length > 0 && (
          <Board
            jobs={applied}
            label={t("boardApplied")}
            borderColor="border-transparent"
            bgColor="bg-blue-100 dark:bg-[#123348]"
            titleClassName="text-[#295a99] dark:text-[#9bc2ff]"
            itemBgColor="bg-[#295a99]/18 dark:bg-[#9bc2ff]/12"
          />
        )}

        {inProcess.length > 0 && (
          <Board
            jobs={inProcess}
            label={t("boardInProcess")}
            borderColor="border-transparent"
            bgColor="bg-[#e8cb72] dark:bg-[#3a2a0f]"
            titleClassName="text-[#7a4b00] dark:text-[#ffd38a]"
            itemBgColor="bg-[#7a4b00]/18 dark:bg-[#ffd38a]/12"
          />
        )}

        {interviewed.length > 0 && (
          <Board
            jobs={interviewed}
            label={t("boardInterview")}
            borderColor="border-transparent"
            bgColor="bg-cyan-100 dark:bg-[#123348]"
            titleClassName="text-app-cyan-strong dark:text-[#8edcff]"
            itemBgColor="bg-[#0e6b8c]/16 dark:bg-[#8edcff]/12"
          />
        )}
        {offers.length > 0 && (
          <Board
            jobs={offers}
            label={t("boardOffer")}
            borderColor="border-transparent"
            bgColor="bg-green-100 dark:bg-[#143325]"
            titleClassName="text-app-green-strong dark:text-[#7ee0a7]"
            itemBgColor="bg-[#1f7a43]/16 dark:bg-[#7ee0a7]/12"
          />
        )}
        {saved.length > 0 && (
          <Board
            jobs={saved}
            label={t("boardSaved")}
            borderColor="border-transparent"
            bgColor="bg-gray-100 dark:bg-app-card"
            titleClassName="text-app-ink"
            itemBgColor="bg-white/55 dark:bg-white/10"
          />
        )}
      </div>
    </section>
  );
}
