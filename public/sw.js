self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "ApplyTrack";
  const options = {
    badge: "/icons/android/mipmap-mdpi/ic_launcher.png",
    body: payload.body || "Du har en ny påminnelse i ApplyTrack.",
    data: {
      url: payload.url || "/",
    },
    icon: payload.icon || "/icons/Assets.xcassets/AppIcon.appiconset/196.png",
    tag: payload.tag || "applytrack-reminder",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);

        if (clientUrl.pathname === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});