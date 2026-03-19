"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Btn } from "@/components/ui/btn";

type LogoutBtnProps = {
  className?: string;
};

export function LogoutBtn({ className }: Readonly<LogoutBtnProps>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/auth");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <Btn className={className} disabled={isSubmitting} onClick={() => void handleLogout()} variant="red">
      {isSubmitting ? "Loggar ut..." : "Logga ut"}
    </Btn>
  );
}