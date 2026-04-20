"use client";

import { JobStatus } from "@/app/types";
import { useUpdateJob } from "@/lib/hooks/jobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type StatusSelectProps = {
  jobId: string;
  initialStatus: JobStatus;
};

export function StatusSelect({ jobId, initialStatus }: Readonly<StatusSelectProps>) {
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const updateJob = useUpdateJob();
  const t = useTranslations("status");

  const statusOptions: Array<{ value: JobStatus; label: string }> = [
    { value: JobStatus.SAVED, label: t("saved") },
    { value: JobStatus.APPLIED, label: t("applied") },
    { value: JobStatus.IN_PROCESS, label: t("inProcess") },
    { value: JobStatus.INTERVIEW, label: t("interview") },
    { value: JobStatus.OFFER, label: t("offer") },
    { value: JobStatus.CLOSED, label: t("closed") },
  ];

  const statusLabelByValue = Object.fromEntries(
    statusOptions.map((option) => [option.value, option.label]),
  ) as Record<JobStatus, string>;

  function handleChange(nextStatus: string | null) {
    const resolvedStatus = (nextStatus ?? initialStatus) as JobStatus;
    const previousStatus = status;

    if (resolvedStatus === previousStatus) return;

    setStatus(resolvedStatus);

    updateJob.mutate(
      { id: jobId, updates: { status: resolvedStatus } },
      {
        onSuccess: () => {
          toast.success(t("changeSuccess", { status: statusLabelByValue[resolvedStatus].toLowerCase() }));
        },
        onError: (error) => {
          setStatus(previousStatus);
          toast.error(
            error instanceof Error ? error.message : t("changeError"),
          );
        },
      },
    );
  }

  return (
    <div className="app-card-dense">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="app-heading-stack-tight">
          <h3 className="text-xl font-display">{t("title")}</h3>
          <p className="text-sm text-app-muted">
            {t("hint")}
          </p>
        </div>

        <label className="flex w-full flex-col gap-2 sm:max-w-xs">
          <Select value={status} onValueChange={handleChange}>
            <SelectTrigger
              aria-label={t("ariaLabel")}
              className="h-12 w-full rounded-2xl border-app-stroke bg-app-surface px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20"
            >
              <SelectValue>{statusLabelByValue[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
    </div>
  );
}
