"use client";

import { updateJob } from "@/app/services/services";
import { JobStatus } from "@/app/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions: Array<{ value: JobStatus; label: string }> = [
  { value: JobStatus.SAVED, label: "Sparad" },
  { value: JobStatus.APPLIED, label: "Ansökt" },
  { value: JobStatus.IN_PROCESS, label: "Pågående" },
  { value: JobStatus.INTERVIEW, label: "Intervju" },
  { value: JobStatus.OFFER, label: "Erbjudande" },
  { value: JobStatus.CLOSED, label: "Avslutad" },
];

const statusLabelByValue = Object.fromEntries(
  statusOptions.map((option) => [option.value, option.label]),
) as Record<JobStatus, string>;

type StatusSelectProps = {
  jobId: string;
  initialStatus: JobStatus;
};

export function StatusSelect({ jobId, initialStatus }: Readonly<StatusSelectProps>) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [message, setMessage] = useState<string>("");

  async function handleChange(nextStatus: string | null) {
    const resolvedStatus = (nextStatus ?? initialStatus) as JobStatus;
    setStatus(resolvedStatus);
    setMessage(`Status ändrad till ${statusLabelByValue[resolvedStatus].toLowerCase()}.`);

    try {
      await updateJob(jobId, { status: resolvedStatus });
      router.refresh();
    } catch {
      setMessage(
        `Status ändrad till ${statusLabelByValue[resolvedStatus].toLowerCase()} lokalt. Jobbet kunde inte uppdateras just nu.`,
      );
    }
  }

  return (
    <div className="rounded-2xl border border-app-stroke bg-app-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-display">Status</h3>
          <p className="mt-1 text-sm text-app-muted">
            Välj var i processen jobbet befinner sig.
          </p>
        </div>

        <label className="flex w-full flex-col gap-2 sm:max-w-xs">
          <Select value={status} onValueChange={handleChange}>
            <SelectTrigger
              aria-label="Ändra status för jobbet"
              className="h-12 w-full rounded-2xl border-app-stroke bg-app-surface px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20"
            >
              <SelectValue />
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

      {message ? <p className="mt-3 text-sm text-app-muted">{message}</p> : null}
    </div>
  );
}
