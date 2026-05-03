"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import { formSecondaryButtonClass } from "@/components/ui/form-field-styles";

export type BarcodeScanButtonProps = {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  /** Modo ventas: varias lecturas seguidas sin cerrar la cámara hasta «Terminado». */
  continuousScan?: boolean;
};

export function BarcodeScanButton({
  onDetected,
  disabled,
  className,
  label = "Escanear código",
  continuousScan = false,
}: BarcodeScanButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={className ?? formSecondaryButtonClass}
      >
        {label}
      </button>
      <BarcodeScanner
        open={open}
        continuous={continuousScan}
        onClose={() => setOpen(false)}
        onDetected={(code) => {
          if (!continuousScan) {
            setOpen(false);
          }
          onDetected(code);
        }}
      />
    </>
  );
}
