import posthog from "posthog-js";

/**
 * All trackable PostHog events.
 *
 * How to add a new tracked button:
 *   1. Add the event key (and optional properties) to AnalyticsEvents below.
 *   2. Pass it as the `track` prop on <Btn>:
 *        <Btn track="my_new_event">Click me</Btn>
 *   3. If you need to attach runtime properties, use trackEvent() in onClick instead:
 *        <Btn onClick={() => trackEvent("add_job_click", { location: "dashboard" })}>...</Btn>
 */
type AnalyticsEvents = {
  // Job actions
  add_job_click: { location?: "dashboard" | "jobs-list" };
  visit_posting_click: undefined;
  edit_job_click: undefined;
  save_job_click: undefined;
  edit_job_cancel_click: undefined;
  delete_job_click: undefined;
  manual_entry_click: undefined;

  // Auth
  auth_submit_click: undefined;
  auth_verify_click: undefined;
  auth_resend_code_click: undefined;
  auth_reset_click: undefined;
  logout_click: undefined;

  // Navigation
  back_click: undefined;

  // Report / Extensions
  install_extension_click: undefined;
};

export type TrackableEvent = keyof AnalyticsEvents;

/** Fire a named event with optional typed properties. */
export function trackEvent<E extends keyof AnalyticsEvents>(
  event: E,
  ...args: AnalyticsEvents[E] extends undefined ? [] : [properties?: AnalyticsEvents[E]]
): void {
  posthog.capture(event, args[0]);
}

/** Fire a named event with no properties. Used internally by <Btn track="…">. */
export function trackButtonEvent(event: TrackableEvent): void {
  posthog.capture(event);
}
