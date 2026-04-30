import { panelInputClass } from "@/components/ui/form-field-styles";

type VerduleriaProductFieldsProps = {
  metadata?: Record<string, unknown> | null;
};

function valueOf(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function checkedOf(metadata: Record<string, unknown> | null | undefined, key: string) {
  return metadata?.[key] === true;
}

export function VerduleriaProductFields({ metadata }: VerduleriaProductFieldsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="is_perishable" defaultChecked={checkedOf(metadata, "is_perishable")} />
        Perecible
      </label>
      <div className="space-y-1 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="allows_weight_sale"
            defaultChecked={checkedOf(metadata, "allows_weight_sale")}
          />
          Venta por peso
        </label>
        <p className="text-xs text-muted-foreground pl-6">
          Al activarla, en ventas podrás vender en decimales (kg, litros) con pasos de 0,5 o según unidad.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="waste_tracking" defaultChecked={checkedOf(metadata, "waste_tracking")} />
        Control de merma
      </label>
      <div className="space-y-1">
        <label htmlFor="expiration_days" className="text-sm font-medium text-foreground">
          Dias de vida util
        </label>
        <input
          id="expiration_days"
          name="expiration_days"
          type="number"
          min="0"
          className={panelInputClass}
          defaultValue={valueOf(metadata, "expiration_days")}
        />
      </div>
    </div>
  );
}
