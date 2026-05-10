"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type UseConfirmExitOptions = {
  /** Si hay cambios sin guardar. */
  isDirty?: boolean;
};

/**
 * Hook para confirmar antes de salir de una página con cambios sin guardar.
 * Retorna el estado del diálogo de confirmación y una función para navegar con confirmación.
 */
export function useConfirmExit(options: UseConfirmExitOptions = {}) {
  const { isDirty = false } = options;
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setPendingNavigation(null);
  }, [pendingNavigation, router]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setPendingNavigation(null);
  }, []);

  /**
   * Navega a la ruta dada, con confirmación si hay datos sucios.
   */
  const confirmAndNavigate = useCallback(
    (href: string) => {
      if (isDirty) {
        setPendingNavigation(href);
        setShowConfirm(true);
      } else {
        router.push(href);
      }
    },
    [isDirty, router],
  );

  return {
    showConfirm,
    setShowConfirm,
    pendingNavigation,
    confirmAndNavigate,
    handleConfirm,
    handleCancel,
  };
}
