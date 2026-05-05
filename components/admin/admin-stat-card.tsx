import { PageSurface } from "@/components/ui/page-surface";

type AdminStatCardProps = {
  label: string;
  value: number;
};

export function AdminStatCard({ label, value }: AdminStatCardProps) {
  return (
    <PageSurface className="space-y-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </PageSurface>
  );
}
