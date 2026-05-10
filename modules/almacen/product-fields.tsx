export function AlmacenProductFields({ metadata }: { metadata?: Record<string, unknown> | null }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">
        No hay campos adicionales para almacén. Los ajustes de alta rotación y acceso rápido
        están disponibles en la sección &quot;Venta rápida&quot;.
      </p>
    </div>
  );
}
