self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("Could not parse push notification payload", error);
  }

  const notificationUrl = new URL(payload.url || "/chat", self.location.origin);
  const safeUrl = notificationUrl.origin === self.location.origin
    ? notificationUrl.href
    : new URL("/chat", self.location.origin).href;

  event.waitUntil(
    self.registration.showNotification(payload.title || "New message", {
      body: payload.body || "Open BI Marketplace to read it.",
      icon: "/icon512_rounded.png",
      badge: "/icon512_maskable.png",
      tag: payload.tag || "new-message",
      renotify: true,
      data: { url: safeUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/chat", self.location.origin);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.navigate(targetUrl.href);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl.href);
    }),
  );
});
