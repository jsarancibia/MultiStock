import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  businessName: string;
  businessTypeLabel: string;
  userEmail: string;
};

export function AppHeader({
  businessName,
  businessTypeLabel,
  userEmail,
}: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-3 md:px-6">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{businessName}</p>
        <p className="text-xs text-muted-foreground">
          {businessTypeLabel} - {userEmail}
        </p>
      </div>

      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          Cerrar sesion
        </Button>
      </form>
    </header>
  );
}
