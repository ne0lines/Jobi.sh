import { NextRequest, NextResponse } from "next/server";

import type { Job, PushNotificationPayload } from "@/app/types";
import { readDb, writeDb } from "@/server/db";
import { buildFollowUpCopy, getDueFollowUpJobs } from "@/server/follow-up";
import { isPushConfigured, sendPushNotification } from "@/server/push";

function isUnauthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV === "production";
  }

  return request.headers.get("authorization") !== `Bearer ${cronSecret}`;
}

function buildPayload(job: Job): PushNotificationPayload {
  const copy = buildFollowUpCopy(job);

  return {
    ...copy,
    icon: "/icons/Assets.xcassets/AppIcon.appiconset/196.png",
    jobId: job.id,
    tag: `follow-up-${job.id}`,
    url: `/jobb/${job.id}`,
  };
}

function getStatusCode(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    return Number((error as { statusCode?: number }).statusCode);
  }

  return null;
}

async function sendReminderForJob(
  job: Job,
  subscriptions: Awaited<ReturnType<typeof readDb>>["pushSubscriptions"],
): Promise<{ invalidEndpoints: Set<string>; sent: boolean }> {
  const payload = buildPayload(job);
  const invalidEndpoints = new Set<string>();
  let sent = false;

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, payload);
      sent = true;
    } catch (error) {
      const statusCode = getStatusCode(error);

      if (statusCode === 404 || statusCode === 410) {
        invalidEndpoints.add(subscription.endpoint);
      }
    }
  }

  return { invalidEndpoints, sent };
}

async function processDueJobs(
  jobs: Job[],
  subscriptions: Awaited<ReturnType<typeof readDb>>["pushSubscriptions"],
): Promise<{ invalidEndpoints: Set<string>; sentJobIds: Set<string> }> {
  const invalidEndpoints = new Set<string>();
  const sentJobIds = new Set<string>();

  for (const job of jobs) {
    const result = await sendReminderForJob(job, subscriptions);

    if (result.sent) {
      sentJobIds.add(job.id);
    }

    for (const endpoint of result.invalidEndpoints) {
      invalidEndpoints.add(endpoint);
    }
  }

  return { invalidEndpoints, sentJobIds };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ error?: string; invalidSubscriptions?: number; sentJobs?: number; totalDueJobs?: number }>> {
  if (isUnauthorized(request)) {
    return NextResponse.json({ error: "Obehörig förfrågan." }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Pushnotiser är inte konfigurerade än." },
      { status: 503 },
    );
  }

  const db = await readDb();
  const dueJobs = getDueFollowUpJobs(db.applications);

  if (dueJobs.length === 0) {
    return NextResponse.json({ invalidSubscriptions: 0, sentJobs: 0, totalDueJobs: 0 });
  }

  if (db.pushSubscriptions.length === 0) {
    return NextResponse.json({ invalidSubscriptions: 0, sentJobs: 0, totalDueJobs: dueJobs.length });
  }

  const { invalidEndpoints, sentJobIds } = await processDueJobs(dueJobs, db.pushSubscriptions);

  const now = new Date().toISOString();
  const nextSubscriptions = db.pushSubscriptions.filter(
    (subscription) => !invalidEndpoints.has(subscription.endpoint),
  );
  const nextApplications = db.applications.map((job) =>
    sentJobIds.has(job.id)
      ? {
          ...job,
          followUpReminderSentAt: now,
        }
      : job,
  );

  if (nextSubscriptions.length !== db.pushSubscriptions.length || sentJobIds.size > 0) {
    await writeDb({
      ...db,
      applications: nextApplications,
      pushSubscriptions: nextSubscriptions,
    });
  }

  return NextResponse.json({
    invalidSubscriptions: invalidEndpoints.size,
    sentJobs: sentJobIds.size,
    totalDueJobs: dueJobs.length,
  });
}