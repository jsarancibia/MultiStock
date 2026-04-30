"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function AlertasError({
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
      title="No pudimos cargar alertas"
      description="No se pudo obtener el estado de alertas del inventario."
      onRetry={reset}
    />
  );
}
