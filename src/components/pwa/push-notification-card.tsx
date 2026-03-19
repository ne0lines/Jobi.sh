"use client";

import { useEffect, useState } from "react";

import { Btn } from "@/components/ui/btn";

type PermissionState = "blocked" | "enabled" | "idle" | "loading" | "unavailable" | "unsupported";

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.codePointAt(index) ?? 0;
  }

  return outputArray.buffer;
}

async function persistSubscription(subscription: PushSubscription): Promise<void> {
  await fetch("/api/push/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
}

export function PushNotificationCard() {
  const [permissionState, setPermissionState] = useState<PermissionState>("loading");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [message, setMessage] = useState("Kontrollerar pushnotiser...");

  useEffect(() => {
    let isMounted = true;

    async function setup(): Promise<void> {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in globalThis) ||
        !("Notification" in globalThis)
      ) {
        if (isMounted) {
          setPermissionState("unsupported");
          setMessage("Din webbläsare stöder inte pushnotiser.");
        }
        return;
      }

      try {
        const publicKeyResponse = await fetch("/api/push/public-key", {
          cache: "no-store",
        });

        if (!publicKeyResponse.ok) {
          if (isMounted) {
            setPermissionState("unavailable");
            setMessage("Pushnotiser är inte konfigurerade än.");
          }
          return;
        }

        const { publicKey: nextPublicKey } = (await publicKeyResponse.json()) as {
          publicKey: string;
        };

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!isMounted) {
          return;
        }

        setPublicKey(nextPublicKey);

        if (Notification.permission === "granted") {
          const subscription =
            (await registration.pushManager.getSubscription()) ??
            (await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToArrayBuffer(nextPublicKey),
            }));

          await persistSubscription(subscription);

          if (isMounted) {
            setPermissionState("enabled");
            setMessage("Pushnotiser är aktiva. ApplyTrack påminner dig efter 7 dagar.");
          }

          return;
        }

        if (Notification.permission === "denied") {
          setPermissionState("blocked");
          setMessage("Pushnotiser är blockerade i webbläsaren. Tillåt notiser för att aktivera påminnelser.");
          return;
        }

        setPermissionState("idle");
        setMessage("Aktivera pushnotiser för att få en påminnelse 7 dagar efter att du sökt ett jobb.");
      } catch {
        if (isMounted) {
          setPermissionState("unavailable");
          setMessage("Kunde inte starta pushnotiser just nu.");
        }
      }
    }

    void setup();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleEnableNotifications(): Promise<void> {
    if (!publicKey) {
      setPermissionState("unavailable");
      setMessage("Pushnotiser är inte konfigurerade än.");
      return;
    }

    try {
      setPermissionState("loading");
      setMessage("Aktiverar pushnotiser...");

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPermissionState(permission === "denied" ? "blocked" : "idle");
        setMessage("Pushnotiser måste tillåtas för att påminnelser ska fungera.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(publicKey),
        }));

      await persistSubscription(subscription);

      setPermissionState("enabled");
      setMessage("Pushnotiser är aktiva. ApplyTrack påminner dig efter 7 dagar.");
    } catch {
      setPermissionState("unavailable");
      setMessage("Kunde inte aktivera pushnotiser just nu.");
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-app-stroke bg-app-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-display">Pushpåminnelser</h2>
          <p className="text-sm text-app-muted">{message}</p>
        </div>

        {permissionState === "idle" || permissionState === "loading" ? (
          <Btn
            className="w-full sm:w-auto"
            disabled={permissionState === "loading"}
            onClick={() => {
              void handleEnableNotifications();
            }}
            variant="secondary"
          >
            {permissionState === "loading" ? "Aktiverar..." : "Aktivera pushnotiser"}
          </Btn>
        ) : null}
      </div>
    </section>
  );
}