"use client";

import { useUpdateJob } from "@/lib/hooks/jobs";
import { Archive, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type ArchiveJobBtnProps = {
  jobId: string;
  archivedAt: string | null;
};

export function ArchiveJobBtn({ jobId, archivedAt }: Readonly<ArchiveJobBtnProps>) {
  const updateJob = useUpdateJob();
  const t = useTranslations("jobs");
  const isArchived = Boolean(archivedAt);
  const Icon = isArchived ? Undo2 : Archive;
  const hoverClassName = isArchived
    ? "hover:bg-emerald-100 hover:text-emerald-700"
    : "hover:bg-app-surface hover:text-app-ink";
  const actionLabel = isArchived ? t("restoreAriaLabel") : t("archiveAriaLabel");

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const fallbackErrorMessage = isArchived
      ? t("restoreError")
      : t("archiveError");

    updateJob.mutate(
      {
        id: jobId,
        updates: {
          archivedAt: isArchived ? null : new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success(isArchived ? t("restoreSuccess") : t("archiveSuccess"));
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : fallbackErrorMessage);
        },
      },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={updateJob.isPending}
      className={`relative z-10 shrink-0 rounded-xl p-2 text-app-muted transition disabled:opacity-60 ${hoverClassName}`}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}