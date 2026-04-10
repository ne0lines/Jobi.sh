import type {
  PushNotificationSettings,
  PushSubscriptionInput,
  UpdatePushNotificationSettingsInput,
} from "../types";

const PUSH_SUBSCRIPTION_API_BASE = "/api/notifications/push-subscription";

async function getErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getPushNotificationSettings(): Promise<PushNotificationSettings> {
  const response = await fetch(PUSH_SUBSCRIPTION_API_BASE, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Kunde inte hämta notisinställningarna."));
  }

  return response.json() as Promise<PushNotificationSettings>;
}

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
): Promise<PushNotificationSettings> {
  const response = await fetch(PUSH_SUBSCRIPTION_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Kunde inte aktivera pushnotiser."));
  }

  return response.json() as Promise<PushNotificationSettings>;
}

export async function removePushSubscription(endpoint: string): Promise<PushNotificationSettings> {
  const response = await fetch(PUSH_SUBSCRIPTION_API_BASE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Kunde inte stänga av pushnotiser."));
  }

  return response.json() as Promise<PushNotificationSettings>;
}

export async function updatePushNotificationSettings(
  settings: UpdatePushNotificationSettingsInput,
): Promise<PushNotificationSettings> {
  const response = await fetch(PUSH_SUBSCRIPTION_API_BASE, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Kunde inte spara notisinställningarna."));
  }

  return response.json() as Promise<PushNotificationSettings>;
}