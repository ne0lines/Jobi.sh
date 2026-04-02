"use client";

import { Btn } from "@/components/ui/btn";
import { Plus } from "lucide-react";

export function AddJobBtn() {
  return (
    <Btn
      className="md:hidden"
      href="/jobb/new"
      icon={Plus}
      track="add_job_click"
    >
      Lägg till jobb
    </Btn>
  );
}
