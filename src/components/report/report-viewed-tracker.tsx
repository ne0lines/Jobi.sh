"use client";

import { useEffect, useRef } from "react";
import { patchUser } from "@/app/services/services";

export function ReportViewedTracker({
  alreadyTracked,
}: {
  alreadyTracked: boolean;
}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!alreadyTracked && !hasFired.current) {
      hasFired.current = true;
      patchUser({ onboardingReportViewed: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
