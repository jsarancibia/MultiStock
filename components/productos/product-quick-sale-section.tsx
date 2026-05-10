"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { formSectionClass } from "@/components/ui/form-field-styles";

type ProductQuickSaleSectionProps = {
  defaultFastRotation?: boolean;
  defaultPinned?: boolean;
};

export function ProductQuickSaleSection({
  defaultFastRotation = false,
  defaultPinned = false,
}: ProductQuickSaleSectionProps) {
  return (
    <div className={formSectionClass}>
      <h2 className="mb-1 text-sm font-semibold text-foreground">3) Venta rápida</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Facilita la venta de este producto en el día a día.
      </p>
      <div className="space-y-2">
        <ToggleSwitch
          name="fast_rotation"
          label="Alta rotación"
          helpText="Producto vendido frecuentemente"
          defaultChecked={defaultFastRotation}
        />
        <ToggleSwitch
          name="pinned"
          label="Acceso rápido en ventas"
          helpText="Mostrar producto rápidamente en pantalla de ventas"
          defaultChecked={defaultPinned}
        />
      </div>
    </div>
  );
}
