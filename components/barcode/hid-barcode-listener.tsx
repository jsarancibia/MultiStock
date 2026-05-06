"use client";

import { useEffect, useState } from "react";
import { Usb } from "lucide-react";
import { cn } from "@/lib/utils";
import { formSecondaryButtonClass } from "@/components/ui/form-field-styles";
import { useHidBarcodeScanner } from "@/lib/barcode/use-hid-scanner";

type HidBarcodeListenerProps = {
  onDetected: (code: string) => void;
  className?: string;
  disabled?: boolean;
  /** Mantiene el lector activo después de cada lectura (útil en ventas). */
  continuous?: boolean;
  /** Texto del botón cuando está inactivo. */
  label?: string;
};

export function HidBarcodeListener({
  onDetected,
  className,
  disabled,
  continuous = false,
  label = "Lector USB",
}: HidBarcodeListenerProps) {
  const [active, setActive] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  useHidBarcodeScanner({
    active: active && !disabled,
    onDetected: (code) => {
      onDetected(code);
      setFeedback({ tone: "success", message: `Leído: ${code}` });
      if (!continuous) setActive(false);
    },
    onInvalid: () =>
      setFeedback({
        tone: "error",
        message: "Código no válido. Intentá de nuevo.",
      }),
  });

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 2200);
    return () => clearTimeout(id);
  }, [feedback]);

  const buttonClass = className ?? formSecondaryButtonClass;

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={active}
        title="Funciona con lectores USB y Bluetooth. Activalo y disparalo sobre el código."
        onClick={() => {
          setActive((value) => !value);
          setFeedback(null);
        }}
        className={cn(
          buttonClass,
          "gap-2",
          active &&
            "border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:border-emerald-400/70 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        )}
      >
        <Usb className="size-4 shrink-0" aria-hidden />
        <span className="truncate">
          {active ? "Lector activo" : label}
        </span>
        {active ? (
          <span
            aria-hidden
            className="ml-1 inline-flex size-2 shrink-0 rounded-full bg-emerald-500 animate-pulse"
          />
        ) : null}
      </button>
      {feedback ? (
        <p
          role="status"
          className={cn(
            "text-xs",
            feedback.tone === "success"
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-rose-600 dark:text-rose-300"
          )}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
