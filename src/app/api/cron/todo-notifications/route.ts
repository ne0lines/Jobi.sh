import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { Job } from "@/app/types";
import { JobStatus } from "@/app/types";
import type { ContactPerson as PrismaContactPerson, Job as PrismaJobModel, TimelineItem as PrismaTimelineItem } from "@/app/generated/prisma/client";
import { getDailyJobSearchTip } from "@/lib/job-search-tips";
import { getTodoItems } from "@/lib/job-insights";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  createJobSearchTipPushPayload,
  createTodoPushPayload,
  getPushSubscriptionsForUser,
  getSentPushNotificationKeys,
  getUsersWithPushSubscriptions,
  isExpiredPushSubscriptionError,
  isWebPushConfigured,
  recordSentPushNotification,
  removePushSubscriptionByEndpoint,
  sendPushNotification,
  type PushNotificationPayload,
  type StoredPushSubscription,
} from "@/lib/push-notifications";

const NOTIFICATION_TIME_ZONE = "Europe/Stockholm";
const NOTIFICATION_HOUR = "09";
const CRON_ROUTE_TAG = "POST /api/cron/todo-notifications";

type JobWithRelations = PrismaJobModel & {
  contactPerson: PrismaContactPerson | null;
  timeline: PrismaTimelineItem[];
};

type SubscribedUser = {
  firstSubscribedAt: Date;
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
  userId: string;
};

const prismaStatusToAppStatus: Record<string, JobStatus> = {
  applied: JobStatus.APPLIED,
  closed: JobStatus.CLOSED,
  in_process: JobStatus.IN_PROCESS,
  interview: JobStatus.INTERVIEW,
  offer: JobStatus.OFFER,
  saved: JobStatus.SAVED,
};

type PushNotificationKind = "tip" | "todo";

type DailyTipSelection = ReturnType<typeof getDailyJobSearchTip>;

type UserNotificationResult = {
  removedSubscriptions: number;
  sentNotifications: number;
  sentTipNotifications: number;
  sentTodoNotifications: number;
  skipped: boolean;
};

function getCronSecret(): string | null {
  return process.env.TODO_NOTIFICATIONS_CRON_SECRET ?? process.env.CRON_SECRET ?? null;
}

function shouldForceNotificationRun(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("force") === "1";
}

function isScheduledNotificationTime(date: Date): boolean {
  const stockholmHour = new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    hour12: false,
    timeZone: NOTIFICATION_TIME_ZONE,
  }).format(date);

  return stockholmHour === NOTIFICATION_HOUR;
}

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = getCronSecret();

  if (!cronSecret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function toAppJob(job: JobWithRelations): Job {
  return {
    archivedAt: job.archivedAt?.toISOString() ?? null,
    company: job.company,
    contactPerson: job.contactPerson ?? { email: "", name: "", phone: "", role: "" },
    employmentType: job.employmentType,
    id: job.id,
    jobUrl: job.jobUrl,
    location: job.location,
    notes: job.notes,
    status: prismaStatusToAppStatus[job.status] ?? JobStatus.SAVED,
    timeline: job.timeline.map((timelineItem) => ({
      date: timelineItem.date,
      event: timelineItem.event,
    })),
    title: job.title,
    userId: job.userId,
    workload: job.workload,
  };
}

async function getJobsForUser(userId: string): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: {
      archivedAt: null,
      userId,
    },
    include: {
      contactPerson: true,
      timeline: true,
    },
  });

  return jobs.map(toAppJob);
}

async function deliverPushPayload({
  notificationKey,
  notificationType,
  payload,
  subscriptions,
  userId,
}: {
  notificationKey: string;
  notificationType: PushNotificationKind;
  payload: PushNotificationPayload;
  subscriptions: StoredPushSubscription[];
  userId: string;
}): Promise<{ delivered: boolean; removedSubscriptions: number }> {
  let delivered = false;
  let removedSubscriptions = 0;

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, payload);
      delivered = true;
    } catch (error) {
      if (isExpiredPushSubscriptionError(error)) {
        await removePushSubscriptionByEndpoint(subscription.endpoint);
        removedSubscriptions += 1;
        continue;
      }

      logger.warn("Failed to deliver push notification", {
        endpoint: subscription.endpoint,
        notificationKey,
        notificationType,
        userId,
      });
      Sentry.captureException(error, {
        tags: { route: CRON_ROUTE_TAG },
        extra: { notificationKey, notificationType, userId },
      });
    }
  }

  return {
    delivered,
    removedSubscriptions,
  };
}

async function sendTodoNotifications({
  subscriptions,
  todoItems,
  userId,
}: {
  subscriptions: StoredPushSubscription[];
  todoItems: ReturnType<typeof getTodoItems>;
  userId: string;
}): Promise<Pick<UserNotificationResult, "removedSubscriptions" | "sentNotifications" | "sentTodoNotifications">> {
  let removedSubscriptions = 0;
  let sentNotifications = 0;
  let sentTodoNotifications = 0;

  const existingNotificationKeys = await getSentPushNotificationKeys(
    userId,
    todoItems.map((todoItem) => todoItem.id),
  );

  const newTodoItems = todoItems.filter((todoItem) => !existingNotificationKeys.has(todoItem.id));

  for (const todoItem of newTodoItems) {
    const deliveryResult = await deliverPushPayload({
      notificationKey: todoItem.id,
      notificationType: "todo",
      payload: createTodoPushPayload(todoItem),
      subscriptions,
      userId,
    });

    removedSubscriptions += deliveryResult.removedSubscriptions;

    if (!deliveryResult.delivered) {
      continue;
    }

    await recordSentPushNotification(userId, todoItem.id);
    sentNotifications += 1;
    sentTodoNotifications += 1;
  }

  return {
    removedSubscriptions,
    sentNotifications,
    sentTodoNotifications,
  };
}

async function sendDailyTipNotification({
  dailyTip,
  subscriptions,
  userId,
}: {
  dailyTip: DailyTipSelection;
  subscriptions: StoredPushSubscription[];
  userId: string;
}): Promise<Pick<UserNotificationResult, "removedSubscriptions" | "sentNotifications" | "sentTipNotifications">> {
  const sentTipKeys = await getSentPushNotificationKeys(userId, [dailyTip.notificationKey]);

  if (sentTipKeys.has(dailyTip.notificationKey)) {
    return {
      removedSubscriptions: 0,
      sentNotifications: 0,
      sentTipNotifications: 0,
    };
  }

  const deliveryResult = await deliverPushPayload({
    notificationKey: dailyTip.notificationKey,
    notificationType: "tip",
    payload: createJobSearchTipPushPayload(dailyTip.tip, dailyTip.dayKey),
    subscriptions,
    userId,
  });

  if (!deliveryResult.delivered) {
    return {
      removedSubscriptions: deliveryResult.removedSubscriptions,
      sentNotifications: 0,
      sentTipNotifications: 0,
    };
  }

  await recordSentPushNotification(userId, dailyTip.notificationKey);

  return {
    removedSubscriptions: deliveryResult.removedSubscriptions,
    sentNotifications: 1,
    sentTipNotifications: 1,
  };
}

async function processSubscribedUser(
  subscribedUser: SubscribedUser,
  dailyTip: DailyTipSelection,
): Promise<UserNotificationResult> {
  const [jobs, subscriptions] = await Promise.all([
    getJobsForUser(subscribedUser.userId),
    getPushSubscriptionsForUser(subscribedUser.userId),
  ]);

  if (subscriptions.length === 0) {
    return {
      removedSubscriptions: 0,
      sentNotifications: 0,
      sentTipNotifications: 0,
      sentTodoNotifications: 0,
      skipped: true,
    };
  }

  const todoItems = getTodoItems(jobs).filter(
    (todoItem) => todoItem.openedAt >= subscribedUser.firstSubscribedAt.getTime(),
  );

  const todoResult = subscribedUser.todoNotificationsEnabled
    ? await sendTodoNotifications({
        subscriptions,
        todoItems,
        userId: subscribedUser.userId,
      })
    : {
        removedSubscriptions: 0,
        sentNotifications: 0,
        sentTodoNotifications: 0,
      };

  if (subscribedUser.todoNotificationsEnabled && todoItems.length > 0) {
    return {
      ...todoResult,
      sentTipNotifications: 0,
      skipped: false,
    };
  }

  if (!subscribedUser.tipNotificationsEnabled) {
    return {
      ...todoResult,
      sentTipNotifications: 0,
      skipped: false,
    };
  }

  const tipResult = await sendDailyTipNotification({
    dailyTip,
    subscriptions,
    userId: subscribedUser.userId,
  });

  return {
    removedSubscriptions: todoResult.removedSubscriptions + tipResult.removedSubscriptions,
    sentNotifications: todoResult.sentNotifications + tipResult.sentNotifications,
    sentTipNotifications: tipResult.sentTipNotifications,
    sentTodoNotifications: todoResult.sentTodoNotifications,
    skipped: false,
  };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ error: string } | Record<string, number | boolean>>> {
  const runDate = new Date();

  if (!getCronSecret()) {
    return NextResponse.json({ error: "Saknar TODO_NOTIFICATIONS_CRON_SECRET eller CRON_SECRET i miljön." }, { status: 503 });
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Otillåten cron-förfrågan." }, { status: 401 });
  }

  const forcedRun = shouldForceNotificationRun(request);

  if (!forcedRun && !isScheduledNotificationTime(runDate)) {
    return NextResponse.json({
      ok: true,
      processedUsers: 0,
      removedSubscriptions: 0,
      sentNotifications: 0,
      skippedForSchedule: true,
    });
  }

  if (!isWebPushConfigured()) {
    return NextResponse.json({ error: "Pushnotiser är inte konfigurerade på servern ännu." }, { status: 503 });
  }

  const dailyTip = getDailyJobSearchTip(runDate, NOTIFICATION_TIME_ZONE);

  let processedUsers = 0;
  let sentNotifications = 0;
  let sentTipNotifications = 0;
  let sentTodoNotifications = 0;
  let removedSubscriptions = 0;
  let skippedUsers = 0;

  try {
    const subscribedUsers = await getUsersWithPushSubscriptions();

    for (const subscribedUser of subscribedUsers) {
      processedUsers += 1;

      try {
        const result = await processSubscribedUser(subscribedUser, dailyTip);

        if (result.skipped) {
          skippedUsers += 1;
          continue;
        }

        removedSubscriptions += result.removedSubscriptions;
        sentNotifications += result.sentNotifications;
        sentTipNotifications += result.sentTipNotifications;
        sentTodoNotifications += result.sentTodoNotifications;
      } catch (error) {
        skippedUsers += 1;
        logger.error("Failed to process push notifications for user", {
          userId: subscribedUser.userId,
        });
        Sentry.captureException(error, {
          tags: { route: CRON_ROUTE_TAG },
          extra: { userId: subscribedUser.userId },
        });
      }
    }
  } catch (error) {
    logger.error("Failed to run todo push notification cron");
    Sentry.captureException(error, { tags: { route: CRON_ROUTE_TAG } });
    return NextResponse.json({ error: "Det gick inte att köra todo-notisjobbet." }, { status: 500 });
  }

  return NextResponse.json({
    forcedRun,
    ok: true,
    processedUsers,
    removedSubscriptions,
    sentNotifications,
    sentTipNotifications,
    sentTodoNotifications,
    skippedForSchedule: false,
    skippedUsers,
  });
}