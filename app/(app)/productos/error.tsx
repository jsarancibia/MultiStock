"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function ProductosError({
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
      title="No pudimos cargar productos"
      description="Intenta de nuevo para recuperar el listado y los filtros."
      onRetry={reset}
    />
  );
}
