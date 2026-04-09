import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ContactPerson as PrismaContactPerson, Job as PrismaJobModel, Prisma, TimelineItem as PrismaTimelineItem } from "@/app/generated/prisma/client";
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

type JobWithRelations = PrismaJobModel & {
  contactPerson: PrismaContactPerson | null;
  timeline: PrismaTimelineItem[];
};

const invalidArchivedAt = Symbol("invalidArchivedAt");

function formatSwedishDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeArchivedAt(value: string | null): string | null | typeof invalidArchivedAt {
  if (value === null) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return invalidArchivedAt;
  }

  return new Date(timestamp).toISOString();
}

function hasDefinedValue<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function isInvalidArchivedAt(value: string | null | typeof invalidArchivedAt | undefined): value is typeof invalidArchivedAt {
  return value === invalidArchivedAt;
}

function isDeadlineEvent(event: string): boolean {
  return event.toLowerCase().includes("sista");
}

function sortTimeline(timeline: Job["timeline"]): Job["timeline"] {
  return [...timeline].sort((firstItem, secondItem) => {
    if (isDeadlineEvent(firstItem.event)) {
      return 1;
    }

    if (isDeadlineEvent(secondItem.event)) {
      return -1;
    }

    return 0;
  });
}

function toJobResponse(job: JobWithRelations, options: { sortTimeline?: boolean } = {}): Job {
  const timeline = job.timeline.map((timelineItem) => ({
    date: timelineItem.date,
    event: timelineItem.event,
  }));

  return {
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
    archivedAt: job.archivedAt?.toISOString() ?? null,
    contactPerson: job.contactPerson ?? { name: "", role: "", email: "", phone: "" },
    timeline: options.sortTimeline ? sortTimeline(timeline) : timeline,
  };
}

function buildJobUpdateData({
  updates,
  nextPrismaStatus,
  nextArchivedAt,
  statusChanged,
}: {
  updates: UpdateJobInput;
  nextPrismaStatus: string | undefined;
  nextArchivedAt: string | null | undefined;
  statusChanged: boolean;
}): Prisma.JobUpdateInput {
  const data: Prisma.JobUpdateInput = {};

  if (hasDefinedValue(updates.title)) {
    data.title = updates.title;
  }

  if (hasDefinedValue(updates.company)) {
    data.company = updates.company;
  }

  if (hasDefinedValue(updates.location)) {
    data.location = updates.location;
  }

  if (hasDefinedValue(updates.employmentType)) {
    data.employmentType = updates.employmentType;
  }

  if (hasDefinedValue(updates.workload)) {
    data.workload = updates.workload;
  }

  if (hasDefinedValue(updates.jobUrl)) {
    data.jobUrl = updates.jobUrl;
  }

  if (hasDefinedValue(updates.notes)) {
    data.notes = updates.notes;
  }

  if (hasDefinedValue(nextPrismaStatus)) {
    data.status = nextPrismaStatus as never;
  }

  if (hasDefinedValue(updates.archivedAt)) {
    data.archivedAt = nextArchivedAt;
  }

  if (hasDefinedValue(updates.contactPerson)) {
    data.contactPerson = {
      upsert: {
        create: updates.contactPerson,
        update: updates.contactPerson,
      },
    };
  }

  if (hasDefinedValue(updates.timeline)) {
    data.timeline = {
      deleteMany: {},
      create: updates.timeline,
    };
    return data;
  }

  if (statusChanged && nextPrismaStatus) {
    data.timeline = {
      create: {
        date: formatSwedishDate(new Date()),
        event: statusTimelineEvent[nextPrismaStatus],
      },
    };
  }

  return data;
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

  return NextResponse.json(toJobResponse(job, { sortTimeline: true }));
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
  const nextArchivedAt = hasDefinedValue(updates.archivedAt)
    ? normalizeArchivedAt(updates.archivedAt)
    : undefined;

  if (isInvalidArchivedAt(nextArchivedAt)) {
    return NextResponse.json({ error: "Ogiltigt arkivdatum." }, { status: 400 });
  }

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

  const nextPrismaStatus = hasDefinedValue(updates.status)
    ? appStatusToPrisma[updates.status]
    : undefined;
  const statusChanged = nextPrismaStatus !== undefined && nextPrismaStatus !== existing.status;

  let job;
  try {
    job = await prisma.job.update({
      where: { id: jobId },
      data: buildJobUpdateData({
        updates,
        nextPrismaStatus,
        nextArchivedAt,
        statusChanged,
      }),
      include: { contactPerson: true, timeline: true },
    });
  } catch (err) {
    logger.error("Failed to update job", {
      userId,
      jobId,
      error: err instanceof Error ? err.message : String(err),
      code: typeof err === "object" && err !== null && "code" in err ? err.code : undefined,
    });
    Sentry.captureException(err, { tags: { route: "PATCH /api/jobs/[jobId]" } });
    return NextResponse.json({ error: "Det gick inte att uppdatera jobbet." }, { status: 500 });
  }

  return NextResponse.json(toJobResponse(job));
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
