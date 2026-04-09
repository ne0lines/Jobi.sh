"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-2xl">Något gick fel</h2>
      <p className="text-sm">Ett oväntat fel inträffade. Försök igen.</p>
      <button
        onClick={reset}
        className="rounded-md bg-app-primary px-4 py-2 text-sm text-white"
      >
        Försök igen
      </button>
    </div>
  );
}
