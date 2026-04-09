import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddJobBtn } from "@/components/dashboard/add-job-btn";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/hooks/query-client";
import { jobKeys } from "@/lib/hooks/job-query-keys";
import { getJobsServer } from "@/server/queries";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: jobKeys.all(),
    queryFn: () => getJobsServer(),
  });

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
          <DashboardContent />
        </HydrationBoundary>
      </div>
    </main>
  );
}
