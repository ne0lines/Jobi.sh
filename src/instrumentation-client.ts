// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
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

  // Add optional integrations for additional features
  integrations: isSentryEnabled ? [Sentry.replayIntegration()] : [],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: sentryTraceSampleRate,
  // Enable logs to be sent to Sentry
  enableLogs: isSentryEnabled,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: sentryReplaySessionSampleRate,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: sentryReplayOnErrorSampleRate,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
