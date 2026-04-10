"use client";

import { Btn } from "@/components/ui/btn";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function AddJobBtn() {
  const t = useTranslations("jobs");

  return (
    <Btn
      className="md:hidden"
      href="/jobb/new"
      icon={Plus}
      track="add_job_click"
    >
      {t("addJobBtn")}
    </Btn>
  );
}
