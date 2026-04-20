"use client";

import {
  usePushNotificationSettings,
  useRemovePushSubscription,
  useSavePushSubscription,
  useUpdatePushNotificationSettings,
} from "@/lib/hooks/notifications";
import { cn } from "@/lib/utils";
import { Bell, BellOff, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  disablePushNotifications,
  enablePushNotifications,
  getStatusLabel,
  getSubscriptionSummary,
  getSupportText,
  syncLocalSubscriptionState,
} from "./push-notification-helpers";
import { toast } from "sonner";

const WEB_PUSH_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ?? "";

type NotificationToggleCardProps = {
  checked: boolean;
  description: string;
  disabled: boolean;
  label: string;
  onClick: () => void;
};

function NotificationToggleCard({
  checked,
  description,
  disabled,
  label,
  onClick,
}: Readonly<NotificationToggleCardProps>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-app-stroke bg-app-card px-4 py-4 text-left transition hover:border-app-primary/25 hover:bg-app-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div>
        <p className="text-sm font-semibold text-app-ink">{label}</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-block h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-app-primary" : "bg-app-stroke",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white transition-all",
            checked ? "start-6" : "start-1",
          )}
        />
      </span>
    </button>
  );
}

export function PushNotificationCard() {
  const t = useTranslations("pushNotifications");
  const settingsQuery = usePushNotificationSettings();
  const savePushSubscription = useSavePushSubscription();
  const removePushSubscription = useRemovePushSubscription();
  const updatePushSettings = useUpdatePushNotificationSettings();
  const [isSupported, setIsSupported] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [localEndpoint, setLocalEndpoint] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    let isMounted = true;

    async function syncState() {
      try {
        await syncLocalSubscriptionState({
          onEndpointChange: (value) => {
            if (isMounted) {
              setLocalEndpoint(value);
            }
          },
          onPermissionChange: (value) => {
            if (isMounted) {
              setPermission(value);
            }
          },
          onSupportChange: (value) => {
            if (isMounted) {
              setIsSupported(value);
            }
          },
        });
      } finally {
        if (isMounted) {
          setIsCheckingSubscription(false);
        }
      }
    }

    void syncState();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasLocalSubscription = Boolean(localEndpoint);
  const subscriptionCount = settingsQuery.data?.subscriptionCount ?? 0;
  const otherDevicesCount = Math.max(subscriptionCount - (hasLocalSubscription ? 1 : 0), 0);
  const isPending =
    isCheckingSubscription ||
    settingsQuery.isLoading ||
    savePushSubscription.isPending ||
    removePushSubscription.isPending ||
    updatePushSettings.isPending;
  const todoNotificationsEnabled = settingsQuery.data?.todoNotificationsEnabled ?? true;
  const tipNotificationsEnabled = settingsQuery.data?.tipNotificationsEnabled ?? true;

  async function handleToggleSettings(setting: "tipNotificationsEnabled" | "todoNotificationsEnabled") {
    if (!settingsQuery.data) {
      return;
    }

    try {
      await updatePushSettings.mutateAsync({
        tipNotificationsEnabled:
          setting === "tipNotificationsEnabled"
            ? !settingsQuery.data.tipNotificationsEnabled
            : settingsQuery.data.tipNotificationsEnabled,
        todoNotificationsEnabled:
          setting === "todoNotificationsEnabled"
            ? !settingsQuery.data.todoNotificationsEnabled
            : settingsQuery.data.todoNotificationsEnabled,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveSettingsError"));
    }
  }

  async function handleEnablePushNotifications() {
    try {
      await enablePushNotifications({
        isSupported,
        onEndpointChange: setLocalEndpoint,
        onPermissionChange: setPermission,
        publicKey: WEB_PUSH_PUBLIC_KEY,
        saveSubscription: savePushSubscription.mutateAsync,
        t,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("enableError"));
    }
  }

  async function handleDisablePushNotifications() {
    try {
      await disablePushNotifications({
        onEndpointChange: setLocalEndpoint,
        onPermissionChange: setPermission,
        removeSubscription: removePushSubscription.mutateAsync,
        t,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("disableError"));
    }
  }

  const statusLabel = getStatusLabel(hasLocalSubscription, permission, t);
  const supportText = getSupportText({
    hasLocalSubscription,
    isSupported,
    permission,
  }, t);
  const subscriptionSummary = getSubscriptionSummary(
    subscriptionCount,
    otherDevicesCount,
    t,
  );

  return (
    <article className="rounded-3xl border border-app-stroke bg-app-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-app-ink">{t("title")}</h2>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            {t("description")}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
            hasLocalSubscription
              ? "bg-app-green text-app-green-strong whitespace-nowrap dark:bg-[#143325] dark:text-[#7ee0a7]"
              : "bg-app-surface text-app-muted dark:bg-white/8",
          )}
        >
          {hasLocalSubscription ? <Bell size={16} /> : <BellOff size={16} />}
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 rounded-3xl border border-app-stroke bg-app-surface p-4 dark:bg-white/5">
        <p className="text-sm text-app-muted">
          {supportText}
        </p>

        {settingsQuery.isError ? (
          <p className="mt-3 text-sm text-app-red-strong">
            {t("loadError")}
          </p>
        ) : (
          <p className="mt-3 text-sm text-app-muted">
            {subscriptionSummary}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <NotificationToggleCard
          checked={todoNotificationsEnabled}
          description={t("todoDescription")}
          disabled={isPending || settingsQuery.isError}
          label={t("todoLabel")}
          onClick={() => {
            void handleToggleSettings("todoNotificationsEnabled");
          }}
        />
        <NotificationToggleCard
          checked={tipNotificationsEnabled}
          description={t("tipsDescription")}
          disabled={isPending || settingsQuery.isError}
          label={t("tipsLabel")}
          onClick={() => {
            void handleToggleSettings("tipNotificationsEnabled");
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleEnablePushNotifications}
          disabled={isPending || !isSupported || hasLocalSubscription}
          className={cn(
            "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
            "bg-app-primary text-white hover:opacity-92",
          )}
        >
          {savePushSubscription.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <Bell size={16} />}
          {t("enableButton")}
        </button>
        <button
          type="button"
          onClick={handleDisablePushNotifications}
          disabled={isPending || !hasLocalSubscription}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-app-stroke bg-app-card px-4 py-3 text-sm font-semibold text-app-ink transition hover:border-app-primary/25 hover:bg-app-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removePushSubscription.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <BellOff size={16} />}
          {t("disableButton")}
        </button>
      </div>
    </article>
  );
}