// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Do not send PII — no user identity, no IP addresses stored
  sendDefaultPii: false,

  // Performance: 100% in dev, 10% in production to stay within quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay: 10% of all sessions, 100% when an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media — required for GDPR compliance
      // since replays would otherwise capture job application data
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known noise
  ignoreErrors: ["ResizeObserver loop limit exceeded"],
});
