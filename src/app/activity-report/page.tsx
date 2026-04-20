import { getReportPageData } from "@/app/report/report-page-data";
import type { Job } from "@/app/types";
import { ReportPageClient } from "@/components/report/report-page-client";
import { ReportViewedTracker } from "@/components/report/report-viewed-tracker";
import { getUserOnboardingFlags } from "@/server/queries";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getJobs(cookieHeader: string): Promise<Job[]> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/jobs?includeArchived=true`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { applications: Job[] };
  return data.applications;
}

export default async function ActivityReportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const headersList = await headers();
  const [applications, userFlags] = await Promise.all([
    getJobs(headersList.get("cookie") ?? ""),
    getUserOnboardingFlags(),
  ]);

  if (applications.length === 0) {
    redirect("/jobs/new");
  }

  const { jobs, options } = getReportPageData(applications);

  return (
    <>
      {/* Default to true when userFlags is null: no profile means PATCH would fail anyway */}
      <ReportViewedTracker alreadyTracked={userFlags?.onboardingReportViewed ?? true} />
      <ReportPageClient jobs={jobs} options={options} />
    </>
  );
}
