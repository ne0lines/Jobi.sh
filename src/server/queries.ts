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

type JobRecord = {
  archivedAt: Date | null;
  company: string;
  contactPerson: {
    email: string;
    name: string;
    phone: string;
    role: string;
  } | null;
  employmentType: string;
  id: string;
  jobUrl: string;
  location: string;
  notes: string;
  status: string;
  timeline: Array<{
    date: string;
    event: string;
  }>;
  title: string;
  updatedAt?: Date;
  userId: string;
  workload: string;
};

function toAppJob(job: JobRecord): Job {
  return {
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
    timeline: job.timeline.map((timelineItem) => ({
      date: timelineItem.date,
      event: timelineItem.event,
    })),
  };
}

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

  return jobs.map((job) => toAppJob(job));
}

export async function getLandingJobsServer(): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: {
      archivedAt: null,
    },
    select: {
      archivedAt: true,
      company: true,
      employmentType: true,
      id: true,
      jobUrl: true,
      location: true,
      notes: true,
      status: true,
      title: true,
      userId: true,
      workload: true,
      timeline: {
        select: {
          date: true,
          event: true,
        },
      },
      contactPerson: {
        select: {
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  return jobs.map((job) => toAppJob(job));
}
