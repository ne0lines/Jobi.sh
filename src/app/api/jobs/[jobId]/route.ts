import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Job, UpdateJobInput } from "@/app/types";
import { JobStatus } from "@/app/types";

const prismaStatusToAppStatus: Record<string, JobStatus> = {
  saved: JobStatus.SAVED,
  applied: JobStatus.APPLIED,
  in_process: JobStatus.IN_PROCESS,
  interview: JobStatus.INTERVIEW,
  offer: JobStatus.OFFER,
  closed: JobStatus.CLOSED,
};

const appStatusToPrisma: Record<string, string> = {
  [JobStatus.SAVED]: "saved",
  [JobStatus.APPLIED]: "applied",
  [JobStatus.IN_PROCESS]: "in_process",
  [JobStatus.INTERVIEW]: "interview",
  [JobStatus.OFFER]: "offer",
  [JobStatus.CLOSED]: "closed",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId },
    include: { contactPerson: true, timeline: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  return NextResponse.json({
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
  } satisfies Job);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const updates = (await request.json()) as UpdateJobInput;

  const existing = await prisma.job.findFirst({ where: { id: jobId, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.company !== undefined && { company: updates.company }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.employmentType !== undefined && { employmentType: updates.employmentType }),
      ...(updates.workload !== undefined && { workload: updates.workload }),
      ...(updates.jobUrl !== undefined && { jobUrl: updates.jobUrl }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.status !== undefined && { status: appStatusToPrisma[updates.status] as never }),
      ...(updates.contactPerson !== undefined && {
        contactPerson: {
          upsert: {
            create: updates.contactPerson,
            update: updates.contactPerson,
          },
        },
      }),
      ...(updates.timeline !== undefined && {
        timeline: {
          deleteMany: {},
          create: updates.timeline,
        },
      }),
    },
    include: { contactPerson: true, timeline: true },
  });

  return NextResponse.json({
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
  } satisfies Job);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { jobId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const existing = await prisma.job.findFirst({ where: { id: jobId, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  await prisma.job.delete({ where: { id: jobId } });

  return NextResponse.json({ success: true });
}
