import { getReportPageData } from "@/app/report/report-page-data";
import { AppliedJobsPageClient } from "@/components/report/applied-jobs-page-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplicationsForUser, readDbForUser } from "../../server/db";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth");
  }

  const db = await readDbForUser(userId);
  const applications = getApplicationsForUser(db.applications, userId);

  if (applications.length === 0) {
    redirect("/jobs/new");
  }

  const { jobs } = getReportPageData(applications);

  return <AppliedJobsPageClient jobs={jobs} />;
}