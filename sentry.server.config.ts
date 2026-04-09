// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Do not send PII — no user identity, no IP addresses stored
  sendDefaultPii: false,

  // Performance: 100% in dev, 10% in production to stay within quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Filter out expected conditions that are not bugs
  beforeSend(event) {
    const status = event.tags?.["http.response.status_code"];
    if (status === 401 || status === 404) return null;
    return event;
  },
});
