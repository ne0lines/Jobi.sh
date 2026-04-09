"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { getPageName } from "@/lib/page-names";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      const qs = searchParams.toString();
      const url = window.location.origin + pathname + (qs ? `?${qs}` : "");
      posthog.capture("$pageview", {
        $current_url: url,
        page_name: getPageName(pathname),
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
