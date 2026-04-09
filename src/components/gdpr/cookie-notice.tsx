"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !localStorage.getItem(STORAGE_KEY);
  });

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed right-0 bottom-[var(--mobile-bottom-nav-clearance)] left-0 z-50 p-3 md:bottom-0 md:p-4">
      <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-app-stroke bg-app-card px-4 py-3 shadow-lg">
        <p className="flex-1 text-sm text-app-ink">
          Den här appen använder cookies för inloggning. Inga spårningscookies
          används.{" "}
          <Link
            href="/privacy"
            className="text-app-primary underline underline-offset-2"
          >
            Läs mer
          </Link>
        </p>
        <button
          onClick={dismiss}
          aria-label="Stäng"
          className="shrink-0 cursor-pointer pt-0.5 leading-none text-app-muted transition-colors hover:text-app-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
