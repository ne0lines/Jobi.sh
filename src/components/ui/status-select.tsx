"use client";

import { updateJob } from "@/app/services/services";
import { JobStatus } from "@/app/types";
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
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [message, setMessage] = useState<string>("");

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as JobStatus;
    setStatus(nextStatus);
    setMessage(`Status ändrad till ${statusLabelByValue[nextStatus].toLowerCase()}.`);

    try {
      await updateJob(jobId, { status: nextStatus });
    } catch {
      setMessage(
        `Status ändrad till ${statusLabelByValue[nextStatus].toLowerCase()} lokalt. Mock-servern kunde inte uppdateras just nu.`,
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
          <select
            aria-label="Ändra status för jobbet"
            className="w-full rounded-2xl border border-app-stroke bg-app-surface px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            value={status}
            onChange={handleChange}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="mt-3 text-sm text-app-muted">{message}</p> : null}
    </div>
  );
}
