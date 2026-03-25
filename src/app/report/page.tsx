import { AppliedJobsPageClient } from "@/components/report/applied-jobs-page-client";
import { getReportPageData } from "@/app/report/report-page-data";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getApplicationsForUser, readDbForUser } from "../../server/db";
import { AUTH_COOKIE_NAME, getUserIdFromHeaders, verifySessionValue } from "../../server/auth-session";
import { getUserById } from "../../server/users";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const userId = getUserIdFromHeaders(headerList) ?? (await verifySessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value));

  if (!userId) {
    redirect("/auth");
  }

  const db = userId ? await readDbForUser(userId) : { applications: [] };
  const applications = userId ? getApplicationsForUser(db.applications, userId) : [];
  const currentUser = userId ? await getUserById(userId) : null;

  if (!currentUser) {
    redirect("/auth");
  }

  if (applications.length === 0) {
    redirect("/jobb/new");
  }

  const { jobs } = getReportPageData(applications);

  return <AppliedJobsPageClient jobs={jobs} />;
}