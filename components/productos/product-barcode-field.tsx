"use client";

import { useState } from "react";
import { BarcodeScanButton } from "@/components/barcode/barcode-scan-button";
import { HidBarcodeListener } from "@/components/barcode/hid-barcode-listener";
import { MobileBarcodeLink } from "@/components/barcode/mobile-barcode-link";
import {
  formSecondaryButtonClass,
  panelInputClass,
} from "@/components/ui/form-field-styles";
import { cn } from "@/lib/utils";

type ProductBarcodeFieldProps = {
  name?: string;
  id?: string;
  defaultValue: string;
  /** Se usa como key para resetear estado al cambiar de producto en edición */
  instanceKey?: string;
  allowMobileLink?: boolean;
};

export function ProductBarcodeField({
  name = "barcode",
  id = "barcode",
  defaultValue,
  instanceKey = "",
  allowMobileLink = true,
}: ProductBarcodeFieldProps) {
  return (
    <ProductBarcodeFieldInner
      key={`${instanceKey}:${defaultValue}`}
      name={name}
      id={id}
      defaultValue={defaultValue}
      allowMobileLink={allowMobileLink}
    />
  );
}

function ProductBarcodeFieldInner({
  name,
  id,
  defaultValue,
  allowMobileLink,
}: Required<Pick<ProductBarcodeFieldProps, "name" | "id" | "defaultValue" | "allowMobileLink">>) {
  const [value, setValue] = useState(defaultValue);

  const actionBtn = cn(
    formSecondaryButtonClass,
    "min-h-10 w-full justify-center sm:w-full lg:min-h-9"
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="min-w-0 space-y-1">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          Código de barras (opcional)
        </label>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={panelInputClass}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Si se repite en este negocio, te diremos qué producto lo está usando.
        </p>
      </div>
      <div
        className={cn(
          "grid min-w-0 gap-2",
          allowMobileLink
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        <BarcodeScanButton className={actionBtn} onDetected={(code) => setValue(code)} />
        {allowMobileLink ? (
          <MobileBarcodeLink className={actionBtn} onDetected={(code) => setValue(code)} />
        ) : null}
        <HidBarcodeListener containerClassName="min-w-0" className={actionBtn} onDetected={(code) => setValue(code)} />
      </div>
    </div>
  );
}
