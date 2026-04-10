import { randomUUID } from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";
import type {
  PushNotificationSettings,
  PushSubscriptionInput,
  UpdatePushNotificationSettingsInput,
} from "@/app/types";
import type { JobSearchTip } from "@/lib/job-search-tips";
import type { TodoItem } from "@/lib/job-insights";
import prisma from "@/lib/prisma";
import webpush from "web-push";

export type StoredPushSubscription = {
  auth: string;
  createdAt: Date;
  endpoint: string;
  id: string;
  p256dh: string;
  userId: string;
};

export type PushNotificationPayload = {
  badge: string;
  body: string;
  icon: string;
  tag: string;
  title: string;
  url: string;
};

type PushSubscriptionCountRow = {
  subscriptionCount: number;
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
};

type PushSubscriptionRow = {
  auth: string;
  createdAt: Date | string;
  endpoint: string;
  id: string;
  p256dh: string;
  userId: string;
};

type SubscriptionUserRow = {
  firstSubscribedAt: Date | string;
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
  userId: string;
};

type NotificationKeyRow = {
  notificationKey: string;
};

let vapidConfigured = false;

function normalizeDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function getWebPushConfig() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const contactEmail = process.env.WEB_PUSH_CONTACT_EMAIL;

  return {
    contactEmail,
    privateKey,
    publicKey,
  };
}

export function isWebPushConfigured(): boolean {
  const { contactEmail, privateKey, publicKey } = getWebPushConfig();

  return Boolean(contactEmail && privateKey && publicKey);
}

function ensureWebPushConfigured() {
  const { contactEmail, privateKey, publicKey } = getWebPushConfig();

  if (!contactEmail || !privateKey || !publicKey) {
    throw new Error("Web push är inte konfigurerat. Lägg till VAPID-nycklar och kontaktmail i miljövariablerna.");
  }

  if (vapidConfigured) {
    return;
  }

  webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
  vapidConfigured = true;
}

export async function getPushNotificationSettings(userId: string): Promise<PushNotificationSettings> {
  const [row] = await prisma.$queryRaw<PushSubscriptionCountRow[]>(Prisma.sql`
    SELECT
      COUNT(subscription."id")::int AS "subscriptionCount",
      user_record."tipNotificationsEnabled",
      user_record."todoNotificationsEnabled"
    FROM "User" user_record
    LEFT JOIN "PushSubscription" subscription ON subscription."userId" = user_record."id"
    WHERE user_record."id" = ${userId}
    GROUP BY user_record."id", user_record."tipNotificationsEnabled", user_record."todoNotificationsEnabled"
  `);

  return {
    subscriptionCount: row?.subscriptionCount ?? 0,
    tipNotificationsEnabled: row?.tipNotificationsEnabled ?? true,
    todoNotificationsEnabled: row?.todoNotificationsEnabled ?? true,
  };
}

export async function updatePushNotificationSettings(
  userId: string,
  settings: UpdatePushNotificationSettingsInput,
): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "User"
    SET
      "todoNotificationsEnabled" = ${settings.todoNotificationsEnabled},
      "tipNotificationsEnabled" = ${settings.tipNotificationsEnabled},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${userId}
  `);
}

export async function upsertPushSubscription(userId: string, subscription: PushSubscriptionInput): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "PushSubscription" (
      "id",
      "userId",
      "endpoint",
      "p256dh",
      "auth",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${userId},
      ${subscription.endpoint},
      ${subscription.keys.p256dh},
      ${subscription.keys.auth},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("endpoint") DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "p256dh" = EXCLUDED."p256dh",
      "auth" = EXCLUDED."auth",
      "updatedAt" = CURRENT_TIMESTAMP
  `);
}

export async function deletePushSubscription(userId: string, endpoint: string): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`
    DELETE FROM "PushSubscription"
    WHERE "userId" = ${userId} AND "endpoint" = ${endpoint}
  `);
}

export async function removePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`
    DELETE FROM "PushSubscription"
    WHERE "endpoint" = ${endpoint}
  `);
}

export async function getPushSubscriptionsForUser(userId: string): Promise<StoredPushSubscription[]> {
  const rows = await prisma.$queryRaw<PushSubscriptionRow[]>(Prisma.sql`
    SELECT "id", "userId", "endpoint", "p256dh", "auth", "createdAt"
    FROM "PushSubscription"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" ASC
  `);

  return rows.map((row) => ({
    ...row,
    createdAt: normalizeDate(row.createdAt),
  }));
}

export async function getUsersWithPushSubscriptions(): Promise<Array<{
  firstSubscribedAt: Date;
  tipNotificationsEnabled: boolean;
  todoNotificationsEnabled: boolean;
  userId: string;
}>> {
  const rows = await prisma.$queryRaw<SubscriptionUserRow[]>(Prisma.sql`
    SELECT
      subscription."userId",
      MIN(subscription."createdAt") AS "firstSubscribedAt",
      user_record."tipNotificationsEnabled",
      user_record."todoNotificationsEnabled"
    FROM "PushSubscription" subscription
    INNER JOIN "User" user_record ON user_record."id" = subscription."userId"
    GROUP BY
      subscription."userId",
      user_record."tipNotificationsEnabled",
      user_record."todoNotificationsEnabled"
  `);

  return rows.map((row) => ({
    firstSubscribedAt: normalizeDate(row.firstSubscribedAt),
    tipNotificationsEnabled: row.tipNotificationsEnabled,
    todoNotificationsEnabled: row.todoNotificationsEnabled,
    userId: row.userId,
  }));
}

export async function getSentPushNotificationKeys(
  userId: string,
  notificationKeys: string[],
): Promise<Set<string>> {
  if (notificationKeys.length === 0) {
    return new Set();
  }

  const rows = await prisma.$queryRaw<NotificationKeyRow[]>(Prisma.sql`
    SELECT "todoId" AS "notificationKey"
    FROM "TodoPushNotification"
    WHERE "userId" = ${userId}
      AND "todoId" IN (${Prisma.join(notificationKeys)})
  `);

  return new Set(rows.map((row) => row.notificationKey));
}

export async function recordSentPushNotification(userId: string, notificationKey: string): Promise<void> {
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "TodoPushNotification" (
      "id",
      "userId",
      "todoId",
      "createdAt"
    )
    VALUES (
      ${randomUUID()},
      ${userId},
      ${notificationKey},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("userId", "todoId") DO NOTHING
  `);
}

export async function getSentTodoIds(userId: string, todoIds: string[]): Promise<Set<string>> {
  return getSentPushNotificationKeys(userId, todoIds);
}

export async function recordSentTodoNotification(userId: string, todoId: string): Promise<void> {
  await recordSentPushNotification(userId, todoId);
}

export function createTodoPushPayload(todoItem: TodoItem): PushNotificationPayload {
  return {
    badge: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    body: todoItem.text,
    icon: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    tag: `todo-${todoItem.id}`,
    title: `Ny att göra: ${todoItem.title}`,
    url: `/jobb/${todoItem.jobId}`,
  };
}

export function createJobSearchTipPushPayload(
  tip: JobSearchTip,
  dayKey: string,
): PushNotificationPayload {
  return {
    badge: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    body: tip.body,
    icon: "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    tag: `daily-tip-${dayKey}-${tip.id}`,
    title: tip.title,
    url: tip.url ?? "/dashboard",
  };
}

export async function sendPushNotification(
  subscription: StoredPushSubscription,
  payload: PushNotificationPayload,
): Promise<void> {
  ensureWebPushConfigured();

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    },
    JSON.stringify(payload),
  );
}

export function isExpiredPushSubscriptionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return false;
  }

  const statusCode = Number((error as { statusCode?: number }).statusCode);
  return statusCode === 404 || statusCode === 410;
}