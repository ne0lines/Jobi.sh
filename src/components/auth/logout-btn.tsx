"use client";

import { Btn } from "@/components/ui/btn";
import { useClerk } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useTranslations } from "next-intl";

type LogoutBtnProps = {
  className?: string;
};

export function LogoutBtn({ className }: Readonly<LogoutBtnProps>) {
  const { signOut } = useClerk();
  const t = useTranslations();

  return (
    <Btn
      className={className}
      onClick={() => {
        posthog.capture("logout_click", undefined, { send_instantly: true });
        signOut({ redirectUrl: "/" });
      }}
      variant="red"
    >
      {t("logout")}
    </Btn>
  );
}
