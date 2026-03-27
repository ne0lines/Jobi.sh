"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteJob } from "@/lib/hooks/jobs";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteJobBtn({ jobId }: Readonly<{ jobId: string }>) {
  const [open, setOpen] = useState(false);
  const deleteJob = useDeleteJob();

  function handleTrigger(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  function handleConfirm() {
    deleteJob.mutate(jobId, {
      onSuccess: () => {
        toast.success("Jobbet togs bort.");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Kunde inte ta bort annonsen.");
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className="relative z-10 shrink-0 rounded-xl p-2 text-app-muted transition hover:bg-red-100 hover:text-red-600"
        aria-label="Ta bort jobb"
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Ta bort jobb?"
        description="Det här går inte att ångra. Jobbet och all tillhörande information tas bort permanent."
        confirmLabel="Ta bort"
        onConfirm={handleConfirm}
        isLoading={deleteJob.isPending}
      />
    </>
  );
}
