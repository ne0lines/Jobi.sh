import { getReportPageData } from "@/app/report/report-page-data";
import type { Job } from "@/app/types";
import { ReportPageClient } from "@/components/report/report-page-client";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getJobs(cookieHeader: string): Promise<Job[]> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/jobs`, {
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
  const applications = await getJobs(headersList.get("cookie") ?? "");

  if (applications.length === 0) {
    redirect("/jobb/new");
  }

  const { jobs, options } = getReportPageData(applications);

  return <ReportPageClient jobs={jobs} options={options} />;
}
