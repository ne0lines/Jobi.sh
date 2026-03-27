import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/hooks/query-client";
import { jobKeys } from "@/lib/hooks/job-query-keys";
import { getJobsServer } from "@/server/queries";
import { JobsContent } from "@/components/jobs/jobs-content";

export default async function JobsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: jobKeys.all,
    queryFn: getJobsServer,
  });

  return (
    <main className="min-h-svh px-4 pt-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <JobsContent />
      </HydrationBoundary>
    </main>
  );
}
