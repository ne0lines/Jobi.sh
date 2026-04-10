"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PushSubscriptionInput,
  UpdatePushNotificationSettingsInput,
} from "@/app/types";
import {
  getPushNotificationSettings,
  removePushSubscription,
  savePushSubscription,
  updatePushNotificationSettings,
} from "@/app/services/notification-services";
import { notificationKeys } from "@/lib/hooks/notification-query-keys";

export function usePushNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.pushSettings,
    queryFn: getPushNotificationSettings,
  });
}

export function useSavePushSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscription: PushSubscriptionInput) => savePushSubscription(subscription),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.root });
    },
  });
}

export function useRemovePushSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (endpoint: string) => removePushSubscription(endpoint),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.root });
    },
  });
}

export function useUpdatePushNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdatePushNotificationSettingsInput) =>
      updatePushNotificationSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.root });
    },
  });
}