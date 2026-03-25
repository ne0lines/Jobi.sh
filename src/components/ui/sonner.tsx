"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: Readonly<ToasterProps>) {
  return (
    <Sonner
      closeButton
      offset={{ bottom: "24px", left: "24px", right: "24px" }}
      mobileOffset={{
        bottom: "var(--mobile-toast-offset)",
        left: "16px",
        right: "16px",
      }}
      position="bottom-center"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border border-app-stroke bg-app-card text-app-ink shadow-lg",
          title: "font-semibold",
          description: "text-app-muted",
          closeButton: "border-app-stroke bg-white text-app-muted hover:bg-app-surface hover:text-app-ink",
        },
      }}
      {...props}
    />
  );
}