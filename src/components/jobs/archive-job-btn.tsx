"use client";

import { useUpdateJob } from "@/lib/hooks/jobs";
import { Archive, Undo2 } from "lucide-react";
import { toast } from "sonner";

type ArchiveJobBtnProps = {
  jobId: string;
  archivedAt: string | null;
};

export function ArchiveJobBtn({ jobId, archivedAt }: Readonly<ArchiveJobBtnProps>) {
  const updateJob = useUpdateJob();
  const isArchived = Boolean(archivedAt);
  const Icon = isArchived ? Undo2 : Archive;
  const hoverClassName = isArchived
    ? "hover:bg-emerald-100 hover:text-emerald-700"
    : "hover:bg-app-surface hover:text-app-ink";

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const fallbackErrorMessage = isArchived
      ? "Kunde inte återställa jobbet."
      : "Kunde inte arkivera jobbet.";

    updateJob.mutate(
      {
        id: jobId,
        updates: {
          archivedAt: isArchived ? null : new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success(isArchived ? "Jobbet återställdes." : "Jobbet arkiverades.");
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
      aria-label={isArchived ? "Återställ jobb" : "Arkivera jobb"}
      title={isArchived ? "Återställ jobb" : "Arkivera jobb"}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}