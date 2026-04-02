import prisma from "@/lib/prisma";
import type { Job } from "@/app/types";
import { JobStatus } from "@/app/types";
import { auth } from "@clerk/nextjs/server";

const prismaStatusToAppStatus: Record<string, JobStatus> = {
  saved: JobStatus.SAVED,
  applied: JobStatus.APPLIED,
  in_process: JobStatus.IN_PROCESS,
  interview: JobStatus.INTERVIEW,
  offer: JobStatus.OFFER,
  closed: JobStatus.CLOSED,
};

type GetJobsServerOptions = {
  includeArchived?: boolean;
};

export async function getJobsServer(options: GetJobsServerOptions = {}): Promise<Job[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const jobs = await prisma.job.findMany({
    where: {
      userId,
      ...(options.includeArchived ? {} : { archivedAt: null }),
    },
    include: { contactPerson: true, timeline: true },
  });

  return jobs.map((job) => ({
    id: job.id,
    userId: job.userId,
    title: job.title,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    workload: job.workload,
    jobUrl: job.jobUrl,
    notes: job.notes ?? undefined,
    status: prismaStatusToAppStatus[job.status] ?? JobStatus.SAVED,
    archivedAt: job.archivedAt?.toISOString() ?? null,
    contactPerson: job.contactPerson ?? { name: "", role: "", email: "", phone: "" },
    timeline: job.timeline.map((t) => ({ date: t.date, event: t.event })),
  }));
}
