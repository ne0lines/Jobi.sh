import { getReportPageData } from "@/app/report/report-page-data";
import { ReportPageClient } from "@/components/report/report-page-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplicationsForUser, readDbForUser } from "../../server/db";

export const dynamic = "force-dynamic";

export default async function ActivityReportPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth");
  }

  const db = await readDbForUser(userId);
  const applications = getApplicationsForUser(db.applications, userId);

  if (applications.length === 0) {
    redirect("/jobb/new");
  }

  const { jobs, options } = getReportPageData(applications);

  return <ReportPageClient jobs={jobs} options={options} />;
}
