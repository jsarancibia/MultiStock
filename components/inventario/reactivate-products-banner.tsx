"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { reactivateAllInactiveProducts } from "@/modules/core/inventory/actions";

type ReactivateBannerProps = {
  count: number;
};

export function ReactivateProductsBanner({ count }: ReactivateBannerProps) {
  const [state, action, pending] = useActionState(reactivateAllInactiveProducts, undefined);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-5" />
          <p className="text-sm font-medium">
            Hay {count} producto(s) inactivo(s) que deberían estar visibles. Esto ocurrió por un bug al crear productos.
          </p>
        </div>
        <form action={action}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={pending}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            {pending ? "Reactivando..." : `Reactivar ${count} producto(s)`}
          </Button>
        </form>
      </div>
      {state?.message && !state.success ? (
        <p className="mt-2 text-sm text-amber-600">{state.message}</p>
      ) : null}
    </div>
  );
}
