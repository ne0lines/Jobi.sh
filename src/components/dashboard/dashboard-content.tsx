"use client";

import { useEffect, useRef, useState } from "react";
import { useJobs } from "@/lib/hooks/jobs";
import { Pipeline, Statistics } from "@/components/dashboard";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { patchUser } from "@/app/services/services";
import type { UserOnboardingFlags } from "@/app/types";

export function DashboardContent({
  userFlags,
}: Readonly<{
  userFlags: UserOnboardingFlags;
}>) {
  const { data: jobs = [], isLoading } = useJobs();
  const hasTrackedPipeline = useRef(false);
  const [dashboardFlags, setDashboardFlags] = useState(userFlags);

  useEffect(() => {
    setDashboardFlags(userFlags);
  }, [userFlags]);

  useEffect(() => {
    if (
      !isLoading &&
      jobs.length > 0 &&
      !dashboardFlags.onboardingPipelineExplored &&
      !hasTrackedPipeline.current
    ) {
      hasTrackedPipeline.current = true;
      patchUser({ onboardingPipelineExplored: true })
        .then(() => {
          setDashboardFlags((currentFlags) => ({
            ...currentFlags,
            onboardingPipelineExplored: true,
          }));
        })
        .catch(() => {
          hasTrackedPipeline.current = false;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardFlags.onboardingPipelineExplored, isLoading, jobs.length]);

  return (
    <>
      <OnboardingChecklist jobs={jobs} userFlags={dashboardFlags} />
      <Pipeline jobs={jobs} />
      <Statistics applications={jobs} />
    </>
  );
}
