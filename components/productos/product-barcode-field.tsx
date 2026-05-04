"use client";

import { useState } from "react";
import { BarcodeScanButton } from "@/components/barcode/barcode-scan-button";
import { MobileBarcodeLink } from "@/components/barcode/mobile-barcode-link";
import {
  formSecondaryButtonClass,
  panelInputClass,
} from "@/components/ui/form-field-styles";

type ProductBarcodeFieldProps = {
  name?: string;
  id?: string;
  defaultValue: string;
  /** Se usa como key para resetear estado al cambiar de producto en edición */
  instanceKey?: string;
};

export function ProductBarcodeField({
  name = "barcode",
  id = "barcode",
  defaultValue,
  instanceKey = "",
}: ProductBarcodeFieldProps) {
  return (
    <ProductBarcodeFieldInner
      key={`${instanceKey}:${defaultValue}`}
      name={name}
      id={id}
      defaultValue={defaultValue}
    />
  );
}

function ProductBarcodeFieldInner({
  name,
  id,
  defaultValue,
}: Required<Pick<ProductBarcodeFieldProps, "name" | "id" | "defaultValue">>) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
      <div className="min-w-0 flex-1 space-y-1">
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
      <BarcodeScanButton
        className={formSecondaryButtonClass}
        onDetected={(code) => setValue(code)}
      />
      <MobileBarcodeLink
        className={formSecondaryButtonClass}
        onDetected={(code) => setValue(code)}
      />
    </div>
  );
}
