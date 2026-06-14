"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
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
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Algo salió mal</h2>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error inesperado. Intentá de nuevo.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
