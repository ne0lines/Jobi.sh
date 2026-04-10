"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteJob } from "@/lib/hooks/jobs";
import { trackEvent } from "@/lib/analytics";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteJobBtn({ jobId }: Readonly<{ jobId: string }>) {
  const [open, setOpen] = useState(false);
  const deleteJob = useDeleteJob();
  const t = useTranslations("jobs");

  function handleTrigger(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    trackEvent("delete_job_click");
    setOpen(true);
  }

  function handleConfirm() {
    deleteJob.mutate(jobId, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"));
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("deleteError"));
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className="relative z-10 shrink-0 rounded-xl p-2 text-app-muted transition hover:bg-red-100 hover:text-red-600"
        aria-label={t("deleteAriaLabel")}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={t("deleteConfirm")}
        onConfirm={handleConfirm}
        isLoading={deleteJob.isPending}
      />
    </>
  );
}
