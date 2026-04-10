import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddJobBtn } from "@/components/dashboard/add-job-btn";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/hooks/query-client";
import { jobKeys } from "@/lib/hooks/job-query-keys";
import { getJobsServer, getUserOnboardingFlags } from "@/server/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { UserOnboardingFlags } from "@/app/types";

const DEFAULT_FLAGS: UserOnboardingFlags = {
  onboardingDismissed: false,
  onboardingPipelineExplored: false,
  onboardingReportViewed: false,
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const queryClient = makeQueryClient();

  const [, userFlags] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: jobKeys.all(),
      queryFn: () => getJobsServer(),
    }),
    getUserOnboardingFlags(),
  ]);

  return (
    <main className="min-h-svh">
      <div className="w-full">
        <section className="w-full">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-4xl leading-none md:hidden">
              Jobi<span className="text-app-primary">.sh</span>
            </h1>
            <AddJobBtn />
          </div>
        </section>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DashboardContent userFlags={userFlags ?? DEFAULT_FLAGS} />
        </HydrationBoundary>
      </div>
    </main>
  );
}