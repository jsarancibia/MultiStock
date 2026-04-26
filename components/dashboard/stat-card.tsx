type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

export function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {helperText ? (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </article>
  );
}
