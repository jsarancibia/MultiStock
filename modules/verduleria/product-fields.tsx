import { panelInputClass } from "@/components/ui/form-field-styles";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

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
    <div className="space-y-3">
      <ToggleSwitch
        name="allows_weight_sale"
        label="Venta por peso"
        helpText="Al activarla, en ventas podrás vender en decimales (kg, litros) con pasos de 0,5 o según unidad."
        defaultChecked={checkedOf(metadata, "allows_weight_sale")}
      />
      <ToggleSwitch
        name="is_perishable"
        label="Producto perecible"
        defaultChecked={checkedOf(metadata, "is_perishable")}
      />
      <ToggleSwitch
        name="waste_tracking"
        label="Control de merma"
        defaultChecked={checkedOf(metadata, "waste_tracking")}
      />
      <div className="space-y-1 pt-1">
        <label htmlFor="expiration_days" className="text-sm font-medium text-foreground">
          Vida útil (días)
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
