"use client";

import { useEffect, useRef } from "react";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";

const MAX_INTERVAL_MS = 50;
const RESET_AFTER_MS = 250;
const MIN_LENGTH = 6;

type UseHidBarcodeScannerOptions = {
  active: boolean;
  onDetected: (code: string) => void;
  onInvalid?: () => void;
};

/**
 * Detecta lecturas de escáner USB/Bluetooth (que se comportan como teclado HID).
 * - No interfiere con tipeo humano: solo dispara si la velocidad es de escáner (< 50ms entre teclas) y la longitud mínima es 6.
 * - Solo intercepta el Enter final cuando confirma que la secuencia fue rápida.
 */
export function useHidBarcodeScanner({
  active,
  onDetected,
  onInvalid,
}: UseHidBarcodeScannerOptions) {
  const bufferRef = useRef<string[]>([]);
  const lastAtRef = useRef<number>(0);
  const fastRef = useRef<boolean>(true);
  const onDetectedRef = useRef(onDetected);
  const onInvalidRef = useRef(onInvalid);

  useEffect(() => {
    onDetectedRef.current = onDetected;
    onInvalidRef.current = onInvalid;
  }, [onDetected, onInvalid]);

  useEffect(() => {
    if (!active) return;

    const reset = () => {
      bufferRef.current = [];
      lastAtRef.current = 0;
      fastRef.current = true;
    };

    const handler = (event: KeyboardEvent) => {
      const now = Date.now();
      if (lastAtRef.current && now - lastAtRef.current > RESET_AFTER_MS) {
        reset();
      }

      if (event.key === "Enter" || event.key === "Tab") {
        const collected = bufferRef.current.join("");
        const wasFast = fastRef.current;
        if (collected.length >= MIN_LENGTH && wasFast) {
          const normalized = normalizeBarcode(collected);
          if (isValidBarcodeFormat(normalized)) {
            event.preventDefault();
            event.stopPropagation();
            onDetectedRef.current(normalized);
            reset();
            return;
          }
          onInvalidRef.current?.();
        }
        reset();
        return;
      }

      if (event.metaKey || event.altKey || event.ctrlKey) return;
      if (event.isComposing) return;
      if (!event.key || event.key.length !== 1) return;

      if (lastAtRef.current && now - lastAtRef.current > MAX_INTERVAL_MS) {
        fastRef.current = false;
      }
      bufferRef.current.push(event.key);
      lastAtRef.current = now;
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
      reset();
    };
  }, [active]);
}
