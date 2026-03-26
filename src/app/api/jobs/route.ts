import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Job } from "@/app/types";
import { JobStatus } from "@/app/types";

type JobsResponse = {
  applications: Job[];
};

const prismaStatusToAppStatus: Record<string, JobStatus> = {
  saved: JobStatus.SAVED,
  applied: JobStatus.APPLIED,
  in_process: JobStatus.IN_PROCESS,
  interview: JobStatus.INTERVIEW,
  offer: JobStatus.OFFER,
  closed: JobStatus.CLOSED,
};

export async function GET(): Promise<NextResponse<JobsResponse | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { userId },
    include: { contactPerson: true, timeline: true },
  });

  const applications: Job[] = jobs.map((job) => ({
    id: job.id,
    userId: job.userId,
    title: job.title,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    workload: job.workload,
    jobUrl: job.jobUrl,
    notes: job.notes,
    status: prismaStatusToAppStatus[job.status] ?? JobStatus.SAVED,
    contactPerson: job.contactPerson ?? { name: "", role: "", email: "", phone: "" },
    timeline: job.timeline.map((t) => ({ date: t.date, event: t.event })),
  }));

  return NextResponse.json({ applications });
}
