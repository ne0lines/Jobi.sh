"use client";

import { Btn } from "@/components/ui/btn";
import { useClerk } from "@clerk/nextjs";

type LogoutBtnProps = {
  className?: string;
};

export function LogoutBtn({ className }: Readonly<LogoutBtnProps>) {
  const { signOut } = useClerk();

  return (
    <Btn
      className={className}
      onClick={() => signOut({ redirectUrl: "/" })}
      variant="red"
    >
      Logga ut
    </Btn>
  );
}
