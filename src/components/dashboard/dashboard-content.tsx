"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/lib/hooks/jobs";
import { Pipeline, Statistics } from "@/components/dashboard";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { patchUser } from "@/app/services/services";
import type { UserOnboardingFlags } from "@/app/types";

export function DashboardContent({
  userFlags,
}: {
  userFlags: UserOnboardingFlags;
}) {
  const { data: jobs = [], isLoading } = useJobs();
  const router = useRouter();
  const hasTrackedPipeline = useRef(false);

  useEffect(() => {
    if (
      !isLoading &&
      jobs.length > 0 &&
      !userFlags.onboardingPipelineExplored &&
      !hasTrackedPipeline.current
    ) {
      hasTrackedPipeline.current = true;
      patchUser({ onboardingPipelineExplored: true })
        .then(() => router.refresh())
        .catch(() => {
          hasTrackedPipeline.current = false;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, jobs.length, userFlags.onboardingPipelineExplored]);

  return (
    <>
      <OnboardingChecklist jobs={jobs} userFlags={userFlags} />
      <Pipeline jobs={jobs} />
      <Statistics applications={jobs} />
    </>
  );
}
