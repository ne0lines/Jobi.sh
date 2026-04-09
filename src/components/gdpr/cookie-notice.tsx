"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_KEY = "cookie-notice-dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(() => {
    if (typeof globalThis.window === "undefined") {
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
    <div className="fixed right-0 bottom-(--mobile-bottom-nav-clearance) left-0 z-50 p-3 md:bottom-0 md:p-4">
      <div className="app-feedback-card mx-auto flex max-w-3xl items-start gap-4 shadow-lg">
        <p className="flex-1 text-sm leading-6 text-app-ink">
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
          className="shrink-0 cursor-pointer pt-1 leading-none text-app-muted transition-colors hover:text-app-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
