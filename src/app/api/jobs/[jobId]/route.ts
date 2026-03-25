import { NextRequest, NextResponse } from "next/server";

import type { Job, UpdateJobInput } from "@/app/types";
import { readDbForUser, writeDb } from "@/server/db";
import { getUserIdFromRequest } from "@/server/auth-session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 400 });
  }

  const db = await readDbForUser(userId);
  const job = db.applications.find(
    (application) => application.id === jobId && application.userId === userId,
  );

  if (!job) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 400 });
  }

  const updates = (await request.json()) as UpdateJobInput;
  const db = await readDbForUser(userId);
  const jobIndex = db.applications.findIndex(
    (application) => application.id === jobId && application.userId === userId,
  );

  if (jobIndex === -1) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  const existingJob = db.applications[jobIndex];
  const updatedJob: Job = {
    ...existingJob,
    ...updates,
    contactPerson: {
      ...existingJob.contactPerson,
      ...updates.contactPerson,
    },
    timeline: updates.timeline ?? existingJob.timeline,
  };

  db.applications[jobIndex] = updatedJob;
  await writeDb(db);

  return NextResponse.json(updatedJob);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { jobId } = await context.params;
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "Kunde inte identifiera användaren." }, { status: 400 });
  }

  const db = await readDbForUser(userId);
  const nextApplications = db.applications.filter(
    (application) => application.id !== jobId || application.userId !== userId,
  );

  if (nextApplications.length === db.applications.length) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  await writeDb({
    ...db,
    applications: nextApplications,
  });

  return NextResponse.json({ success: true });
}