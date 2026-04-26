export default function AppLoading() {
  return (
    <section className="space-y-4">
      <div className="h-7 w-56 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </section>
  );
}
