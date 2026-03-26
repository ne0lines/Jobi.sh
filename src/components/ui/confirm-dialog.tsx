"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Btn } from "@/components/ui/btn";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Bekräfta",
  onConfirm,
  isLoading = false,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[9998] bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-app-stroke bg-white p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Dialog.Title className="font-display text-xl text-app-ink">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-base text-app-muted">
              {description}
            </Dialog.Description>
            <div className="mt-6 flex gap-3">
              <Dialog.Close
                render={
                  <Btn variant="secondary" className="w-full" disabled={isLoading}>
                    Avbryt
                  </Btn>
                }
              />
              <Btn
                variant="red"
                className="w-full"
                disabled={isLoading}
                onClick={onConfirm}
              >
                {isLoading ? "Tar bort..." : confirmLabel}
              </Btn>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
