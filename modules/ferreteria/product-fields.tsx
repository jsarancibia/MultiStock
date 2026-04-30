import { panelInputClass, panelTextareaClass } from "@/components/ui/form-field-styles";

type FerreteriaProductFieldsProps = {
  metadata?: Record<string, unknown> | null;
};

function valueOf(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

export function FerreteriaProductFields({ metadata }: FerreteriaProductFieldsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="brand" className="text-sm font-medium text-foreground">
          Marca
        </label>
        <input id="brand" name="brand" className={panelInputClass} defaultValue={valueOf(metadata, "brand")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="model" className="text-sm font-medium text-foreground">
          Modelo
        </label>
        <input id="model" name="model" className={panelInputClass} defaultValue={valueOf(metadata, "model")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="material" className="text-sm font-medium text-foreground">
          Material
        </label>
        <input id="material" name="material" className={panelInputClass} defaultValue={valueOf(metadata, "material")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="measure" className="text-sm font-medium text-foreground">
          Medida
        </label>
        <input id="measure" name="measure" className={panelInputClass} defaultValue={valueOf(metadata, "measure")} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="technical_specs" className="text-sm font-medium text-foreground">
          Especificaciones tecnicas
        </label>
        <textarea
          id="technical_specs"
          name="technical_specs"
          className={panelTextareaClass}
          defaultValue={valueOf(metadata, "technical_specs")}
        />
      </div>
    </div>
  );
}
