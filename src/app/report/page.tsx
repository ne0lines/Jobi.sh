import type { Job, JobTimelineItem } from "@/app/types";
import { ReportPageClient } from "@/components/report/report-page-client";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getApplicationsForUser, readDbForUser } from "../../server/db";
import { AUTH_COOKIE_NAME, getUserIdFromHeaders, verifySessionValue } from "../../server/auth-session";
import { getUserById } from "../../server/users";

export const dynamic = "force-dynamic";

type ReportJobEntry = {
  id: string;
  title: string;
  company: string;
  location: string;
  workload: string;
  applicationDate: string;
  monthKey: string;
};

type ReportOption = {
  key: string;
  label: string;
};

const monthMap: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  mars: 2,
  apr: 3,
  april: 3,
  maj: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augusti: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseSwedishDate(value: string): Date | null {
  const trimmedValue = value.trim().toLowerCase();
  const match = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const monthToken = match[2].replace(".", "");
  const year = Number(match[3]);
  const month = monthMap[monthToken];

  if (month === undefined) {
    return null;
  }

  return new Date(year, month, day);
}

function getApplicationTimelineItem(job: Job): JobTimelineItem | undefined {
  return job.timeline.find((item) => item.event.toLowerCase().includes("ansökan skickad"));
}

function getMonthKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  }).format(date);
}

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

  const jobs = applications
    .map((job): ReportJobEntry | null => {
      const applicationTimelineItem = getApplicationTimelineItem(job);

      if (!applicationTimelineItem) {
        return null;
      }

      const parsedDate = parseSwedishDate(applicationTimelineItem.date);

      if (!parsedDate) {
        return null;
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workload: job.workload,
        applicationDate: applicationTimelineItem.date,
        monthKey: getMonthKey(parsedDate),
      };
    })
    .filter((job): job is ReportJobEntry => job !== null)
    .sort((firstJob, secondJob) => secondJob.applicationDate.localeCompare(firstJob.applicationDate, "sv"));

  const optionMap = new Map<string, ReportOption>();

  for (const job of jobs) {
    if (optionMap.has(job.monthKey)) {
      continue;
    }

    const [year, month] = job.monthKey.split("-");
    const optionDate = new Date(Number(year), Number(month) - 1, 1);

    optionMap.set(job.monthKey, {
      key: job.monthKey,
      label: getMonthLabel(optionDate),
    });
  }

  const options = Array.from(optionMap.values()).sort((firstOption, secondOption) =>
    secondOption.key.localeCompare(firstOption.key),
  );

  const sortedJobs = [...jobs].sort((firstJob, secondJob) =>
    secondJob.monthKey.localeCompare(firstJob.monthKey) ||
    secondJob.applicationDate.localeCompare(firstJob.applicationDate, "sv"),
  );

  return <ReportPageClient jobs={sortedJobs} options={options} />;
}