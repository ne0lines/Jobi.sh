import type { PushSubscriptionInput } from "@/app/types";
import { toast } from "sonner";

type TranslationValues = Record<string, number | string>;
type PushNotificationsTranslator = (
  key: string,
  values?: TranslationValues,
) => string;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalizedValue = `${base64String}${padding}`
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const rawData = globalThis.atob(normalizedValue);
  const values = Array.from(rawData).map((character) => character.codePointAt(0) ?? 0);
  const buffer = new ArrayBuffer(values.length);
  const bytes = new Uint8Array(buffer);

  values.forEach((value, index) => {
    bytes[index] = value;
  });

  return buffer;
}

async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

function toPushSubscriptionInput(
  subscription: PushSubscription,
  t: PushNotificationsTranslator,
): PushSubscriptionInput {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.auth || !json.keys.p256dh) {
    throw new Error(t("invalidSubscriptionError"));
  }

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      auth: json.keys.auth,
      p256dh: json.keys.p256dh,
    },
  };
}

export function supportsPushNotifications(): boolean {
  return Boolean(
    globalThis.isSecureContext &&
      "Notification" in globalThis &&
      "serviceWorker" in navigator &&
      "PushManager" in globalThis,
  );
}

export function getStatusLabel(
  hasLocalSubscription: boolean,
  permission: NotificationPermission,
  t: PushNotificationsTranslator,
): string {
  if (hasLocalSubscription) {
    return t("statusActiveLocal");
  }

  if (permission === "denied") {
    return t("statusBlocked");
  }

  return t("statusInactive");
}

export function getSupportText({
  hasLocalSubscription,
  isSupported,
  permission,
}: {
  hasLocalSubscription: boolean;
  isSupported: boolean;
  permission: NotificationPermission;
}, t: PushNotificationsTranslator): string {
  if (!isSupported) {
    return t("supportUnsupported");
  }

  if (permission === "denied") {
    return t("supportBlocked");
  }

  if (hasLocalSubscription) {
    return t("supportActive");
  }

  return t("supportInactive");
}

export function getSubscriptionSummary(
  subscriptionCount: number,
  otherDevicesCount: number,
  t: PushNotificationsTranslator,
): string {
  if (subscriptionCount === 0) {
    return t("subscriptionNone");
  }

  if (otherDevicesCount === 0) {
    return t("subscriptionCount", { count: subscriptionCount });
  }

  if (otherDevicesCount === 1) {
    return t("subscriptionCountWithOneOther", { count: subscriptionCount });
  }

  return t("subscriptionCountWithManyOthers", {
    count: subscriptionCount,
    otherCount: otherDevicesCount,
  });
}

export async function syncLocalSubscriptionState({
  onEndpointChange,
  onPermissionChange,
  onSupportChange,
}: {
  onEndpointChange: (value: string | null) => void;
  onPermissionChange: (value: NotificationPermission) => void;
  onSupportChange: (value: boolean) => void;
}): Promise<void> {
  const supported = supportsPushNotifications();
  onSupportChange(supported);

  if (!supported) {
    onEndpointChange(null);
    return;
  }

  onPermissionChange(Notification.permission);
  const subscription = await getCurrentPushSubscription();
  onEndpointChange(subscription?.endpoint ?? null);
}

export async function enablePushNotifications({
  isSupported,
  onEndpointChange,
  onPermissionChange,
  publicKey,
  saveSubscription,
  t,
}: {
  isSupported: boolean;
  onEndpointChange: (value: string | null) => void;
  onPermissionChange: (value: NotificationPermission) => void;
  publicKey: string;
  saveSubscription: (subscription: PushSubscriptionInput) => Promise<unknown>;
  t: PushNotificationsTranslator;
}): Promise<void> {
  if (!isSupported) {
    toast.error(t("toastUnsupported"));
    return;
  }

  if (!publicKey) {
    toast.error(t("toastMissingConfig"));
    return;
  }

  let nextPermission = Notification.permission;

  if (nextPermission !== "granted") {
    nextPermission = await Notification.requestPermission();
  }

  onPermissionChange(nextPermission);

  if (nextPermission !== "granted") {
    toast.error(t("toastPermissionDenied"));
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(publicKey),
      userVisibleOnly: true,
    });
  }

  await saveSubscription(toPushSubscriptionInput(subscription, t));
  onEndpointChange(subscription.endpoint);
  toast.success(t("toastEnabled"));
}

export async function disablePushNotifications({
  onEndpointChange,
  onPermissionChange,
  removeSubscription,
  t,
}: {
  onEndpointChange: (value: string | null) => void;
  onPermissionChange: (value: NotificationPermission) => void;
  removeSubscription: (endpoint: string) => Promise<unknown>;
  t: PushNotificationsTranslator;
}): Promise<void> {
  const subscription = await getCurrentPushSubscription();

  if (!subscription?.endpoint) {
    onEndpointChange(null);
    toast(t("toastAlreadyDisabled"));
    return;
  }

  await removeSubscription(subscription.endpoint);
  await subscription.unsubscribe();
  onEndpointChange(null);
  onPermissionChange(Notification.permission);
  toast.success(t("toastDisabled"));
}