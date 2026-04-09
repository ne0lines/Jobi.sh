import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getPostHogServer } from "@/lib/posthog-server";
import type { CreateJobInput, Job } from "@/app/types";
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

const appStatusToPrisma: Record<string, string> = {
  [JobStatus.SAVED]: "saved",
  [JobStatus.APPLIED]: "applied",
  [JobStatus.IN_PROCESS]: "in_process",
  [JobStatus.INTERVIEW]: "interview",
  [JobStatus.OFFER]: "offer",
  [JobStatus.CLOSED]: "closed",
};

export async function GET(request: NextRequest): Promise<NextResponse<JobsResponse | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";

  let jobs;
  try {
    jobs = await prisma.job.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      include: { contactPerson: true, timeline: true },
    });
  } catch (err) {
    logger.error("Failed to fetch jobs", { userId });
    Sentry.captureException(err, { tags: { route: "GET /api/jobs" } });
    return NextResponse.json({ error: "Det gick inte att hämta jobben." }, { status: 500 });
  }

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
    archivedAt: job.archivedAt?.toISOString() ?? null,
    contactPerson: job.contactPerson ?? { name: "", role: "", email: "", phone: "" },
    timeline: job.timeline.map((t) => ({ date: t.date, event: t.event })),
  }));

  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest): Promise<NextResponse<Job | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 401 });
  }

  const payload = (await req.json()) as CreateJobInput;

  if (!payload.title || !payload.company) {
    return NextResponse.json({ error: "Jobbtitel och företag måste anges." }, { status: 400 });
  }

  let job;
  try {
    job = await prisma.job.create({
      data: {
        userId,
        title: payload.title,
        company: payload.company,
        location: payload.location ?? "",
        employmentType: payload.employmentType ?? "",
        workload: payload.workload ?? "",
        jobUrl: payload.jobUrl ?? "",
        notes: payload.notes ?? "",
        status: appStatusToPrisma[payload.status] as never ?? "saved",
        contactPerson: payload.contactPerson
          ? { create: payload.contactPerson }
          : undefined,
        timeline: payload.timeline?.length
          ? { create: payload.timeline }
          : undefined,
      },
      include: { contactPerson: true, timeline: true },
    });
  } catch (err) {
    logger.error("Failed to create job", { userId });
    Sentry.captureException(err, { tags: { route: "POST /api/jobs" } });
    return NextResponse.json({ error: "Det gick inte att skapa jobbet." }, { status: 500 });
  }

  // Track job creation server-side — reliable even when browser navigates away immediately
  try {
    const posthog = getPostHogServer();
    const domain = job.jobUrl
      ? (() => { try { return new URL(job.jobUrl).hostname.replace(/^www\./, ""); } catch { return null; } })()
      : null;

    posthog.capture({
      distinctId: "anonymous",
      event: "job_created",
      properties: {
        ...(domain ? { source_domain: domain } : {}),
        $process_person_profile: false, // match client-side person_profiles: "never"
      },
    });
    await posthog.flush();
  } catch { /* analytics failure must never affect the response */ }

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
    archivedAt: job.archivedAt?.toISOString() ?? null,
    contactPerson: job.contactPerson ?? { name: "", role: "", email: "", phone: "" },
    timeline: job.timeline.map((t) => ({ date: t.date, event: t.event })),
  } satisfies Job, { status: 201 });
}
