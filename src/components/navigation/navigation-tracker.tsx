"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const IN_APP_NAV_KEY = "jobish:hasInAppNav";

export function NavigationTracker() {
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      window.sessionStorage.setItem(IN_APP_NAV_KEY, "1");
    } catch {
      // sessionStorage unavailable (private mode, SSR bridging) — safe to ignore
    }
  }, [pathname]);

  return null;
}
