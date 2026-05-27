export default function VentaLoading() {
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando...</span>
      <div className="h-8 w-44 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </section>
  );
}
