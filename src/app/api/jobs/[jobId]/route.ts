import { NextRequest, NextResponse } from "next/server";

import type { Job, UpdateJobInput } from "@/app/types";
import { readDb, writeDb } from "@/server/db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<Job | { error: string }>> {
  const { jobId } = await context.params;
  const db = await readDb();
  const job = db.applications.find((application) => application.id === jobId);

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
  const updates = (await request.json()) as UpdateJobInput;
  const db = await readDb();
  const jobIndex = db.applications.findIndex((application) => application.id === jobId);

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
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { jobId } = await context.params;
  const db = await readDb();
  const nextApplications = db.applications.filter((application) => application.id !== jobId);

  if (nextApplications.length === db.applications.length) {
    return NextResponse.json({ error: "Jobbet kunde inte hittas." }, { status: 404 });
  }

  await writeDb({
    ...db,
    applications: nextApplications,
  });

  return NextResponse.json({ success: true });
}