"use client";

import { Btn } from "@/components/ui/btn";
import { useClerk } from "@clerk/nextjs";
import posthog from "posthog-js";

type LogoutBtnProps = {
  className?: string;
};

export function LogoutBtn({ className }: Readonly<LogoutBtnProps>) {
  const { signOut } = useClerk();

  return (
    <Btn
      className={className}
      onClick={() => {
        posthog.capture("logout_click", undefined, { send_instantly: true });
        signOut({ redirectUrl: "/" });
      }}
      variant="red"
    >
      Logga ut
    </Btn>
  );
}
