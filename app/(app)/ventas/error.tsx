"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function VentasError({
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
      title="No pudimos cargar ventas"
      description="La información de ventas no está disponible temporalmente."
      onRetry={reset}
    />
  );
}
