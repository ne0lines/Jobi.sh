import webpush from "web-push";

import type { PushNotificationPayload, PushSubscriptionRecord } from "@/app/types";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY ?? "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY ?? "";
const vapidSubject = process.env.VAPID_SUBJECT ?? "";

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) {
    return true;
  }

  if (!publicVapidKey || !privateVapidKey || !vapidSubject) {
    return false;
  }

  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  vapidConfigured = true;
  return true;
}

export function getPublicVapidKey(): string | null {
  return publicVapidKey || null;
}

export function isPushConfigured(): boolean {
  return Boolean(publicVapidKey && privateVapidKey && vapidSubject);
}

export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushNotificationPayload,
): Promise<void> {
  if (!ensureVapidConfigured()) {
    throw new Error("Push notifications are not configured.");
  }

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: subscription.keys,
    },
    JSON.stringify(payload),
  );
}