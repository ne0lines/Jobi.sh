import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHogServer(): PostHog {
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: "https://eu.i.posthog.com",
      flushAt: 1,       // send immediately — critical in serverless (no persistent process)
      flushInterval: 0, // no batching delay
    });
    client.debug(false);
  }
  return client;
}
