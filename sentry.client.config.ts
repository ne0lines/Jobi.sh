// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isSentryEnabled =
  process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
const sentryTraceSampleRate = isSentryEnabled ? 1 / 10 : 0;
const sentryReplaySessionSampleRate = isSentryEnabled ? 1 / 10 : 0;
const sentryReplayOnErrorSampleRate = isSentryEnabled ? 1 : 0;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isSentryEnabled,

  // Do not send PII — no user identity, no IP addresses stored
  sendDefaultPii: false,

  // Performance: 100% in dev, 10% in production to stay within quota
  tracesSampleRate: sentryTraceSampleRate,

  // Session Replay: 10% of all sessions, 100% when an error occurs
  replaysSessionSampleRate: sentryReplaySessionSampleRate,
  replaysOnErrorSampleRate: sentryReplayOnErrorSampleRate,

  integrations: isSentryEnabled
    ? [
        Sentry.replayIntegration({
          // Mask all text and block all media — required for GDPR compliance
          // since replays would otherwise capture job application data
          maskAllText: true,
          blockAllMedia: true,
        }),
      ]
    : [],

  // Filter out known noise
  ignoreErrors: ["ResizeObserver loop limit exceeded"],
});
