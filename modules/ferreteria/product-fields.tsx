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
    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="brand" className="text-sm font-medium">
          Marca
        </label>
        <input id="brand" name="brand" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={valueOf(metadata, "brand")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="model" className="text-sm font-medium">
          Modelo
        </label>
        <input id="model" name="model" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={valueOf(metadata, "model")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="material" className="text-sm font-medium">
          Material
        </label>
        <input id="material" name="material" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={valueOf(metadata, "material")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="measure" className="text-sm font-medium">
          Medida
        </label>
        <input id="measure" name="measure" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={valueOf(metadata, "measure")} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="technical_specs" className="text-sm font-medium">
          Especificaciones tecnicas
        </label>
        <textarea
          id="technical_specs"
          name="technical_specs"
          className="w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={valueOf(metadata, "technical_specs")}
        />
      </div>
    </div>
  );
}
