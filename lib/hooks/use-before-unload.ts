"use client";

import { useEffect } from "react";

/**
 * Hook que previene el cierre accidental del navegador
 * cuando hay cambios sin guardar.
 *
 * @param isDirty - Si hay datos sin guardar en el formulario.
 */
export function useBeforeUnload(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
