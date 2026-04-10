import type { PushSubscriptionInput } from "@/app/types";
import { toast } from "sonner";

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

function toPushSubscriptionInput(subscription: PushSubscription): PushSubscriptionInput {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.auth || !json.keys.p256dh) {
    throw new Error("Webbläsaren returnerade en ofullständig push subscription.");
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
): string {
  if (hasLocalSubscription) {
    return "Aktivt på den här enheten";
  }

  if (permission === "denied") {
    return "Blockerade i webbläsaren";
  }

  return "Inte aktiva ännu";
}

export function getSupportText({
  hasLocalSubscription,
  isSupported,
  permission,
}: {
  hasLocalSubscription: boolean;
  isSupported: boolean;
  permission: NotificationPermission;
}): string {
  if (!isSupported) {
    return "Pushnotiser kräver en modern webbläsare med service worker-stöd och HTTPS eller localhost.";
  }

  if (permission === "denied") {
    return "Webbläsaren blockerar notiser just nu. Tillåt notiser i browser-inställningarna om du vill aktivera funktionen igen.";
  }

  if (hasLocalSubscription) {
    return "Den här enheten är registrerad för pushnotiser från Jobi.sh. Du väljer själv om vi ska skicka Att göra, Tips eller båda.";
  }

  return "Aktivera pushnotiser på den här enheten för att fånga upp nya att göra direkt och få ett jobbsökartips de dagar listan är tom.";
}

export function getSubscriptionSummary(subscriptionCount: number, otherDevicesCount: number): string {
  if (subscriptionCount === 0) {
    return "Inga push-enheter registrerade ännu.";
  }

  if (otherDevicesCount === 0) {
    return `Aktiva push-enheter på kontot: ${subscriptionCount}.`;
  }

  const deviceLabel = otherDevicesCount > 1 ? "andra enheter" : "annan enhet";
  return `Aktiva push-enheter på kontot: ${subscriptionCount}, varav ${otherDevicesCount} ${deviceLabel}.`;
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
}: {
  isSupported: boolean;
  onEndpointChange: (value: string | null) => void;
  onPermissionChange: (value: NotificationPermission) => void;
  publicKey: string;
  saveSubscription: (subscription: PushSubscriptionInput) => Promise<unknown>;
}): Promise<void> {
  if (!isSupported) {
    toast.error("Pushnotiser stöds inte i den här webbläsaren.");
    return;
  }

  if (!publicKey) {
    toast.error("Pushnotiser är inte konfigurerade ännu. Lägg till VAPID-nyckeln i miljövariablerna.");
    return;
  }

  let nextPermission = Notification.permission;

  if (nextPermission !== "granted") {
    nextPermission = await Notification.requestPermission();
  }

  onPermissionChange(nextPermission);

  if (nextPermission !== "granted") {
    toast.error("Tillåt notiser i webbläsaren för att kunna aktivera pushnotiser.");
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

  await saveSubscription(toPushSubscriptionInput(subscription));
  onEndpointChange(subscription.endpoint);
  toast.success("Pushnotiser aktiverade. Du får att göra-notiser i första hand och annars ett dagligt jobbsökartips.");
}

export async function disablePushNotifications({
  onEndpointChange,
  onPermissionChange,
  removeSubscription,
}: {
  onEndpointChange: (value: string | null) => void;
  onPermissionChange: (value: NotificationPermission) => void;
  removeSubscription: (endpoint: string) => Promise<unknown>;
}): Promise<void> {
  const subscription = await getCurrentPushSubscription();

  if (!subscription?.endpoint) {
    onEndpointChange(null);
    toast("Pushnotiser var redan avstängda på den här enheten.");
    return;
  }

  await removeSubscription(subscription.endpoint);
  await subscription.unsubscribe();
  onEndpointChange(null);
  onPermissionChange(Notification.permission);
  toast.success("Pushnotiser avstängda på den här enheten.");
}