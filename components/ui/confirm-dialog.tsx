"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Descartar cambios",
  description = "¿Deseas cancelar? Se perderán los cambios no guardados.",
  confirmLabel = "Cancelar",
  cancelLabel = "Seguir editando",
  onConfirm,
  onCancel,
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[ending-style='fade']:opacity-0 data-[starting-style='fade']:opacity-0" />
        <AlertDialog.Popup
          className={cn(
            "fixed bottom-0 left-1/2 z-50 mx-auto w-full max-w-md -translate-x-1/2 rounded-t-2xl border border-border bg-card p-6 text-card-foreground shadow-lg outline-none",
            "md:bottom-1/2 md:translate-y-1/2 md:rounded-2xl",
            "data-[ending-style='scale-fade']:scale-95 data-[ending-style='scale-fade']:opacity-0",
            "data-[starting-style='scale-fade']:scale-95 data-[starting-style='scale-fade']:opacity-0",
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                variant === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <TriangleAlert className="size-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <AlertDialog.Title className="text-base font-semibold">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground">
                {description}
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Close
              render={
                <Button
                  variant="outline"
                  onClick={onCancel}
                />
              }
            >
              {cancelLabel}
            </AlertDialog.Close>
            <AlertDialog.Close
              render={
                <Button
                  variant={variant === "destructive" ? "destructive" : "default"}
                  onClick={onConfirm}
                />
              }
            >
              {confirmLabel}
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
