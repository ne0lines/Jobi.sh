"use client";

import { useJobs } from "@/lib/hooks/jobs";
import { Pipeline, Statistics } from "@/components/dashboard";

export function DashboardContent() {
  const { data: jobs = [] } = useJobs();

  return (
    <>
      <Pipeline jobs={jobs} />
      <Statistics applications={jobs} />
    </>
  );
}
