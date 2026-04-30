export default function AlertasLoading() {
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-36 animate-pulse rounded bg-muted" />
      <div className="h-80 animate-pulse rounded-lg bg-muted" />
    </section>
  );
}
