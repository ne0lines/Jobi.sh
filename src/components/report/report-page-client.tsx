"use client";

import type { ReportJobEntry, ReportOption } from "@/app/report/report-page-data";
import { Btn } from "@/components/ui/btn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ReportPageClientProps = {
  jobs: ReportJobEntry[];
  options: ReportOption[];
};

function CopyTrigger({
  children,
  onClick,
  className,
}: Readonly<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}>) {
  return (
    <button
      className={className}
      type="button"
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        <Copy aria-hidden="true" className="shrink-0 opacity-35" size={14} strokeWidth={2.1} />
      </span>
    </button>
  );
}

async function copyTextToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Kopierat till urklipp.");
  } catch {
    toast.error("Kunde inte kopiera till urklipp.");
  }
}

export function ReportPageClient({ jobs, options }: Readonly<ReportPageClientProps>) {
  const [selectedMonth, setSelectedMonth] = useState(options[0]?.key ?? "");

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.monthKey === selectedMonth),
    [jobs, selectedMonth],
  );

  if (options.length === 0) {
    return (
      <main className="min-h-svh pt-4">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8 md:max-w-none">
          <h1 className="font-display text-4xl md:text-[2.4rem]">Aktivitetsrapport</h1>
          <p className="text-lg text-app-muted">
            Det finns inga registrerade ansökningsdatum att rapportera ännu.
          </p>
          <Btn href="/" variant="secondary">
            Tillbaka
          </Btn>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh pt-4">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 md:max-w-none">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl md:text-[2.4rem]">Aktivitetsrapport</h1>
            <p className="text-lg text-app-muted">
              Välj månad för att se vilka jobb du sökte under perioden.
            </p>
          </div>

          <label className="flex w-full flex-col gap-2 sm:max-w-xs">
            <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value ?? "") }>
              <SelectTrigger className="h-12 w-full rounded-2xl border-app-stroke bg-white px-4 text-base text-app-ink focus-visible:border-app-primary focus-visible:ring-app-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex flex-col gap-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-app-stroke bg-app-card p-4"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4">
                  <CopyTrigger
                    className="font-display text-left text-base font-bold transition truncate hover:text-app-primary"
                    onClick={() => void copyTextToClipboard(job.title)}
                  >
                    {job.title}
                  </CopyTrigger>
                  <p className="shrink-0 text-sm text-app-muted text-right">
                    {job.applicationDate}
                  </p>
                </div>

                <div className="mb-2">
                  <CopyTrigger
                    className="mt-1 block text-left text-app-muted transition hover:text-app-primary"
                    onClick={() => void copyTextToClipboard(job.company)}
                  >
                    {job.company}
                  </CopyTrigger>
                </div>

                <div className="flex items-start justify-between gap-4 text-sm text-app-muted">
                  <p className="min-w-0">
                    <strong className="text-app-ink">Plats:</strong>{" "}
                    {job.location ? (
                      <CopyTrigger
                        className="text-left transition hover:text-app-primary"
                        onClick={() => void copyTextToClipboard(job.location)}
                      >
                        {job.location}
                      </CopyTrigger>
                    ) : (
                      <span className="italic">Ej angiven</span>
                    )}
                  </p>
                  <p className="shrink-0 text-right">
                    <strong className="text-app-ink">Omfattning:</strong>{" "}
                    {job.workload || <span className="italic">Ej angiven</span>}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}