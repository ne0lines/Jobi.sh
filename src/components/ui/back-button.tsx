"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/btn";
import { IN_APP_NAV_KEY } from "@/components/navigation/navigation-tracker";
import { trackButtonEvent, type TrackableEvent } from "@/lib/analytics";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
  track?: TrackableEvent;
  fullWidth?: boolean;
};

export function BackButton({
  fallbackHref = "/dashboard",
  label,
  className,
  track,
  fullWidth,
}: Readonly<BackButtonProps>) {
  const router = useRouter();
  const t = useTranslations("common");

  function handleClick() {
    if (track) trackButtonEvent(track);

    const hasInAppNav =
      typeof window !== "undefined" &&
      (() => {
        try {
          return window.sessionStorage.getItem(IN_APP_NAV_KEY) === "1";
        } catch {
          return false;
        }
      })();

    if (hasInAppNav) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Btn
      type="button"
      variant="secondary"
      onClick={handleClick}
      className={className}
      fullWidth={fullWidth}
    >
      {label ?? t("back")}
    </Btn>
  );
}
