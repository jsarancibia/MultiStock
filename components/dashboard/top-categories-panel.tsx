type TopCategoriesPanelProps = {
  items: { name: string; count: number }[];
};

export function TopCategoriesPanel({ items }: TopCategoriesPanelProps) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">Sin categorías asignadas en productos activos.</p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="truncate font-medium">{c.name}</span>
            <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
              {c.count} prod.
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${(c.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
