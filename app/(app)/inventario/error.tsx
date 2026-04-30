"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function InventarioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageErrorState
      title="No pudimos cargar inventario"
      description="Falló la carga de stock o movimientos. Reintenta."
      onRetry={reset}
    />
  );
}
