import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
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

const statusTimelineEvent: Record<string, string> = {
  saved: "Jobbet sparat",
  applied: "Ansökan skickad",
  in_process: "Pågår",
  interview: "Intervju",
  offer: "Erbjudande mottaget",
  closed: "Avslutad",
};

function formatSwedishDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  let job;
  try {
    job = await prisma.job.findFirst({
      where: { id: jobId, userId },
      include: { contactPerson: true, timeline: true },
    });
  } catch (err) {
    logger.error("Failed to fetch job", { userId, jobId });
    Sentry.captureException(err, { tags: { route: "GET /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att hämta jobbet." }, { status: 500 });
  }

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
    timeline: job.timeline
      .map((t) => ({ date: t.date, event: t.event }))
      .sort((a, b) => {
        const isDeadline = (e: string) => e.toLowerCase().includes("sista");
        if (isDeadline(a.event)) return 1;
        if (isDeadline(b.event)) return -1;
        return 0;
      }),
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

  let existing;
  try {
    existing = await prisma.job.findFirst({ where: { id: jobId, userId } });
  } catch (err) {
    logger.error("Failed to fetch job for update", { userId, jobId });
    Sentry.captureException(err, { tags: { route: "PATCH /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att hämta jobbet." }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  const nextPrismaStatus = updates.status !== undefined ? appStatusToPrisma[updates.status] : undefined;
  const statusChanged = nextPrismaStatus !== undefined && nextPrismaStatus !== existing.status;

  let job;
  try {
    job = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.company !== undefined && { company: updates.company }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.employmentType !== undefined && { employmentType: updates.employmentType }),
        ...(updates.workload !== undefined && { workload: updates.workload }),
        ...(updates.jobUrl !== undefined && { jobUrl: updates.jobUrl }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(nextPrismaStatus !== undefined && { status: nextPrismaStatus as never }),
        ...(updates.contactPerson !== undefined && {
          contactPerson: {
            upsert: {
              create: updates.contactPerson,
              update: updates.contactPerson,
            },
          },
        }),
        ...(updates.timeline !== undefined
          ? { timeline: { deleteMany: {}, create: updates.timeline } }
          : statusChanged && {
              timeline: {
                create: {
                  date: formatSwedishDate(new Date()),
                  event: statusTimelineEvent[nextPrismaStatus],
                },
              },
            }),
      },
      include: { contactPerson: true, timeline: true },
    });
  } catch (err) {
    logger.error("Failed to update job", { userId, jobId });
    Sentry.captureException(err, { tags: { route: "PATCH /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att uppdatera jobbet." }, { status: 500 });
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { jobId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  let existing;
  try {
    existing = await prisma.job.findFirst({ where: { id: jobId, userId } });
  } catch (err) {
    logger.error("Failed to fetch job for deletion", { userId, jobId });
    Sentry.captureException(err, { tags: { route: "DELETE /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att hämta jobbet." }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  try {
    await prisma.job.delete({ where: { id: jobId } });
  } catch (err) {
    logger.error("Failed to delete job", { userId, jobId });
    Sentry.captureException(err, { tags: { route: "DELETE /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att ta bort jobbet." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
