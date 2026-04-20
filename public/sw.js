globalThis.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};

  try {
    payload = event.data.json();
  } catch {
    payload = {
      body: event.data.text(),
    };
  }

  const title = payload.title ?? "Jobi.sh";
  const options = {
    badge: payload.badge ?? "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    body: payload.body ?? "Du har en ny att göra i Jobi.sh.",
    data: {
      url: payload.url ?? "/dashboard",
    },
    icon: payload.icon ?? "/icons/Assets.xcassets/AppIcon.appiconset/192.png",
    tag: payload.tag,
  };

  event.waitUntil(globalThis.registration.showNotification(title, options));
});

globalThis.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url ?? "/dashboard",
    globalThis.location.origin,
  ).href;

  event.waitUntil(
    globalThis.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
      const exactClient = clients.find((client) => client.url === targetUrl);

      if (exactClient) {
        return exactClient.focus();
      }

      const sameOriginClient = clients.find((client) => client.url.startsWith(globalThis.location.origin));

      if (sameOriginClient && "navigate" in sameOriginClient) {
        return sameOriginClient.navigate(targetUrl).then((client) => client?.focus());
      }

      return globalThis.clients.openWindow(targetUrl);
    }),
  );
});

globalThis.addEventListener("install", () => {
  globalThis.skipWaiting();
});

globalThis.addEventListener("activate", (event) => {
  event.waitUntil(globalThis.clients.claim());
});

globalThis.addEventListener("fetch", () => {
  // The app only needs a controlling service worker to qualify for installability.
});