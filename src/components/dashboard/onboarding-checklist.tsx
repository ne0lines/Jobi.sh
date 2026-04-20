"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Job, UserOnboardingFlags } from "@/app/types";
import { JobStatus } from "@/app/types";
import { patchUser } from "@/app/services/services";

type Step = {
  label: string;
  done: boolean;
  href: string;
};

export function OnboardingChecklist({
  jobs,
  userFlags,
}: Readonly<{
  jobs: Job[];
  userFlags: UserOnboardingFlags;
}>) {
  const [dismissed, setDismissed] = useState(false);

  const step1Done = jobs.length > 0;
  const step2Done = jobs.some((j) => j.status !== JobStatus.SAVED);
  const step3Done = userFlags.onboardingPipelineExplored;
  const step4Done = userFlags.onboardingReportViewed;
  const allDone = step1Done && step2Done && step3Done && step4Done;

  const steps: Step[] = [
    {
      label: "Lägg till ditt första jobb",
      done: step1Done,
      href: "/jobs/new",
    },
    {
      label: "Uppdatera ett jobbs status",
      done: step2Done,
      href: jobs.length > 0 ? `/jobs/${jobs[0].id}` : "/jobs/new",
    },
    {
      label: "Utforska din pipeline",
      done: step3Done,
      href: "/",
    },
    {
      label: "Skapa en aktivitetsrapport",
      done: step4Done,
      href: "/activity-report",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  async function handleDismiss() {
    setDismissed(true);
    try {
      await patchUser({ onboardingDismissed: true });
    } catch {
      setDismissed(false);
    }
  }

  if (dismissed || userFlags.onboardingDismissed) {
    return null;
  }

  if (allDone) {
    return (
      <article className="mt-4 rounded-2xl border border-app-stroke bg-app-green p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-xl text-app-green-strong">Du är redo!</h3>
        </div>
        <p className="mb-4 text-sm text-app-green-strong">
          Du har gått igenom alla steg och är redo att använda Jobi.sh fullt ut.
        </p>
        <button
          onClick={handleDismiss}
          className="w-full cursor-pointer rounded-xl bg-app-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-primary-strong"
        >
          Stäng
        </button>
      </article>
    );
  }

  return (
    <article className="mt-4 rounded-2xl border border-app-stroke bg-app-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xl font-display">Kom igång</h3>
        <button
          onClick={handleDismiss}
          className="text-sm text-app-muted transition hover:text-app-ink"
        >
          Dölj
        </button>
      </div>
      <p className="mb-3 text-sm text-app-muted">
        {completedCount} av {steps.length} klart
      </p>
      <div className="divide-y divide-app-stroke">
        {steps.map((step) =>
          step.done ? (
            <div
              key={step.label}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <CheckCircle2 className="size-5 shrink-0 text-green-500" />
              <span className="text-base text-app-muted line-through">{step.label}</span>
            </div>
          ) : (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:text-app-primary transition"
            >
              <div className="size-5 shrink-0 rounded-full border-2 border-app-stroke" />
              <span className="text-base text-app-ink">{step.label}</span>
              <span className="ml-auto text-sm text-app-primary" aria-hidden="true">→</span>
            </Link>
          )
        )}
      </div>
    </article>
  );
}
