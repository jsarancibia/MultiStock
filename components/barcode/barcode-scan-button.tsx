"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import { formSecondaryButtonClass } from "@/components/ui/form-field-styles";

export type BarcodeScanButtonProps = {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export function BarcodeScanButton({
  onDetected,
  disabled,
  className,
  label = "Escanear código",
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
        onClose={() => setOpen(false)}
        onDetected={(code) => {
          setOpen(false);
          onDetected(code);
        }}
      />
    </>
  );
}
