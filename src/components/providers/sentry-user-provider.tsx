"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";

export function SentryUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // Only set the ID — never email or name (PII)
      Sentry.setUser({ id: user.id });
    } else {
      Sentry.setUser(null);
    }
  }, [user, isLoaded]);

  return <>{children}</>;
}
