"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type PageNavigationProps = {
  backHref: string;
  backLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  showCancel?: boolean;
  /** Si es true, navega directamente sin confirmación (no hay datos sucios). */
  isClean?: boolean;
};

export function PageNavigation({
  backHref,
  backLabel,
  onCancel,
  cancelLabel = "Cancelar",
  showCancel = true,
  isClean = false,
}: PageNavigationProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else if (isClean) {
      router.push(backHref);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    router.push(backHref);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <BackButton href={backHref} label={backLabel} />
        {showCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
            {cancelLabel}
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
