"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserCodeReader, BrowserMultiFormatReader } from "@zxing/browser";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";

export type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
};

type ScanStatus = "idle" | "preparing" | "scanning" | "invalid_read" | "error";

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasDetectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
    onCloseRef.current = onClose;
  }, [onDetected, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    hasDetectedRef.current = false;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    let cancelled = false;

    const startId = requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video || cancelled) {
        setStatus("error");
        setErrorMessage("No se pudo preparar la vista de cámara.");
        return;
      }

      setStatus("preparing");
      setErrorMessage(null);

      reader
        .decodeFromVideoDevice(undefined, video, (result, _err, controls) => {
          if (cancelled || hasDetectedRef.current) return;
          if (!result) return;
          const text = result.getText();
          const normalized = normalizeBarcode(text);
          if (!isValidBarcodeFormat(normalized)) {
            setStatus("invalid_read");
            return;
          }
          hasDetectedRef.current = true;
          try {
            controls.stop();
          } catch {
            /* ignore */
          }
          controlsRef.current = null;
          onDetectedRef.current(normalized);
          onCloseRef.current();
        })
        .then((controls) => {
          if (cancelled) {
            controls.stop();
            return;
          }
          controlsRef.current = controls;
          setStatus("scanning");
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setStatus("error");
          const msg = err instanceof Error ? err.message : String(err);
          const lower = msg.toLowerCase();
          if (lower.includes("permission") || lower.includes("notallowed")) {
            setErrorMessage("Permiso de cámara denegado. Puedes ingresar el código a mano.");
          } else if (lower.includes("notfound") || lower.includes("no device")) {
            setErrorMessage("No hay cámara disponible en este dispositivo.");
          } else {
            setErrorMessage("No se pudo acceder a la cámara.");
          }
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      try {
        controlsRef.current?.stop();
      } catch {
        /* ignore */
      }
      controlsRef.current = null;
      readerRef.current = null;
      BrowserCodeReader.releaseAllStreams();
    };
  }, [open]);

  if (!open) return null;

  const statusLabel: Record<ScanStatus, string> = {
    idle: "",
    preparing: "Preparando cámara…",
    scanning: "Escaneando… apunta al código",
    invalid_read: "Código no válido, sigue intentando…",
    error: errorMessage ?? "Error",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Escanear código de barras"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3 text-white">
        <p className="text-sm font-medium">Escanear código</p>
        <button
          type="button"
          className="rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={() => {
            try {
              controlsRef.current?.stop();
            } catch {
              /* ignore */
            }
            BrowserCodeReader.releaseAllStreams();
            onClose();
          }}
        >
          Cerrar
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-3">
        <video
          ref={videoRef}
          className="max-h-[min(70vh,560px)] w-full max-w-lg rounded-lg object-cover"
          muted
          playsInline
        />
        <p className="mt-3 max-w-md text-center text-sm text-white/90">
          {status === "error" ? errorMessage : statusLabel[status]}
        </p>
      </div>
    </div>
  );
}
