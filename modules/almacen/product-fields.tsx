import { panelInputClass } from "@/components/ui/form-field-styles";

type AlmacenProductFieldsProps = {
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

export function AlmacenProductFields({ metadata }: AlmacenProductFieldsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="fast_rotation" defaultChecked={checkedOf(metadata, "fast_rotation")} />
        Alta rotacion
      </label>
      <div className="space-y-1">
        <label htmlFor="suggested_margin" className="text-sm font-medium text-foreground">
          Margen sugerido (%)
        </label>
        <input
          id="suggested_margin"
          name="suggested_margin"
          type="number"
          min="0"
          step="0.01"
          className={panelInputClass}
          defaultValue={valueOf(metadata, "suggested_margin")}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="commercial_category" className="text-sm font-medium text-foreground">
          Categoria comercial
        </label>
        <input
          id="commercial_category"
          name="commercial_category"
          className={panelInputClass}
          defaultValue={valueOf(metadata, "commercial_category")}
        />
      </div>
    </div>
  );
}
