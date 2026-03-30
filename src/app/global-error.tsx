"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="sv">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100svh",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Kritiskt fel</h2>
        <p>Appen kunde inte laddas. Försök ladda om.</p>
        <button onClick={reset}>Ladda om</button>
      </body>
    </html>
  );
}
