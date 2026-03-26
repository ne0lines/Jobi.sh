"use client";

import { deleteJob } from "@/app/services/services";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteJobBtn({ jobId }: Readonly<{ jobId: string }>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleTrigger(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  async function handleConfirm() {
    setIsDeleting(true);

    try {
      await deleteJob(jobId);
      toast.success("Jobbet togs bort.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunde inte ta bort annonsen.");
      setIsDeleting(false);
    }
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
        onConfirm={() => void handleConfirm()}
        isLoading={isDeleting}
      />
    </>
  );
}
