"use client";

import { Btn } from "@/components/ui/btn";
import Image from "next/image";
import { useMemo, useState } from "react";

type ReportJobEntry = {
  id: string;
  title: string;
  company: string;
  location: string;
  workload: string;
  applicationDate: string;
  monthKey: string;
};

type ReportOption = {
  key: string;
  label: string;
};

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
        <Image
          alt="Kopiera"
          className="shrink-0 opacity-35"
          height={14}
          src="/MaterialSymbolsContentCopyOutline.svg"
          unoptimized
          width={14}
        />
      </span>
    </button>
  );
}

async function copyTextToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    globalThis.alert("Kunde inte kopiera till urklipp.");
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
      <main className="min-h-screen p-4 pt-20 sm:p-5">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8">
          <h1 className="font-display text-4xl sm:text-5xl">Aktivitetsrapport</h1>
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
    <main className="min-h-screen p-4 pt-20 sm:p-5">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">Aktivitetsrapport</h1>
            <p className="text-lg text-app-muted">
              Välj månad för att se vilka jobb du sökte under perioden.
            </p>
          </div>

          <label className="flex w-full flex-col gap-2 sm:max-w-xs">
            <select
              className="w-full rounded-2xl border border-app-stroke bg-white px-4 py-3 text-base text-app-ink outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
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
                    className="font-display text-left text-xl transition hover:text-app-primary"
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
                    <CopyTrigger
                      className="text-left transition hover:text-app-primary"
                      onClick={() => void copyTextToClipboard(job.location)}
                    >
                      {job.location}
                    </CopyTrigger>
                  </p>
                  <p className="shrink-0 text-right">
                    <strong className="text-app-ink">Omfattning:</strong> {job.workload}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Btn href="/" variant="secondary">
          Tillbaka
        </Btn>
      </section>
    </main>
  );
}