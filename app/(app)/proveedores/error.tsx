"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/ui/page-error-state";

export default function ProveedoresError({
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
      title="No pudimos cargar proveedores"
      description="Hubo un problema recuperando el listado de proveedores."
      onRetry={reset}
    />
  );
}
