import { headers } from "next/headers";
import { getPostHogServer } from "@/lib/posthog-server";
import { getPageName } from "@/lib/page-names";

export async function PostHogServerPageView() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  const posthog = getPostHogServer();
  posthog.capture({
    distinctId: "anonymous",
    event: "$pageview",
    properties: {
      $current_url: pathname,
      page_name: getPageName(pathname),
      $process_person_profile: false,
    },
  });
  await posthog.flush();

  return null;
}
