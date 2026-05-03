"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserCodeReader, BrowserMultiFormatReader } from "@zxing/browser";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";

export type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
  /** Si es true, no cierra tras cada lectura: permite escanear varios códigos seguidos hasta «Terminado». */
  continuous?: boolean;
};

type ScanStatus = "idle" | "preparing" | "scanning" | "invalid_read" | "error";

const DEDUPE_MS = 900;
const REARM_MS = 450;

export function BarcodeScanner({ open, onClose, onDetected, continuous = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasDetectedRef = useRef(false);
  const lastEmittedRef = useRef<{ code: string; at: number } | null>(null);
  const rearmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continuousRef = useRef(continuous);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastOkRead, setLastOkRead] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
    onCloseRef.current = onClose;
  }, [onDetected, onClose]);

  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    hasDetectedRef.current = false;
    lastEmittedRef.current = null;
    startTransition(() => setLastOkRead(null));
    if (rearmTimerRef.current) {
      clearTimeout(rearmTimerRef.current);
      rearmTimerRef.current = null;
    }

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

          if (continuousRef.current) {
            const now = Date.now();
            const prev = lastEmittedRef.current;
            if (prev && prev.code === normalized && now - prev.at < DEDUPE_MS) {
              return;
            }
            lastEmittedRef.current = { code: normalized, at: now };
          }

          hasDetectedRef.current = true;

          if (continuousRef.current) {
            onDetectedRef.current(normalized);
            setLastOkRead(normalized);
            setStatus("scanning");
            if (rearmTimerRef.current) clearTimeout(rearmTimerRef.current);
            rearmTimerRef.current = setTimeout(() => {
              if (!cancelled) {
                hasDetectedRef.current = false;
              }
            }, REARM_MS);
            return;
          }

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
      document.body.style.overflow = prevOverflow;
      if (rearmTimerRef.current) {
        clearTimeout(rearmTimerRef.current);
        rearmTimerRef.current = null;
      }
      try {
        controlsRef.current?.stop();
      } catch {
        /* ignore */
      }
      controlsRef.current = null;
      readerRef.current = null;
      BrowserCodeReader.releaseAllStreams();
    };
  }, [open, continuous]);

  if (!open) return null;

  if (typeof document === "undefined") return null;

  const statusLabel: Record<ScanStatus, string> = {
    idle: "",
    preparing: "Preparando cámara…",
    scanning: continuous
      ? "Escaneando… leé varios códigos seguidos. Tocá «Terminado» abajo cuando termines."
      : "Escaneando… apunta al código",
    invalid_read: "Código no válido, sigue intentando…",
    error: errorMessage ?? "Error",
  };

  function stopScannerAndClose() {
    if (rearmTimerRef.current) {
      clearTimeout(rearmTimerRef.current);
      rearmTimerRef.current = null;
    }
    try {
      controlsRef.current?.stop();
    } catch {
      /* ignore */
    }
    BrowserCodeReader.releaseAllStreams();
    controlsRef.current = null;
    onClose();
  }

  const overlay = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 pt-[env(safe-area-inset-top)]"
      role="dialog"
      aria-modal="true"
      aria-label={continuous ? "Escanear varios códigos de barras" : "Escanear código de barras"}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 text-white">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {continuous ? "Escanear productos" : "Escanear código"}
        </p>
        <button
          type="button"
          className="shrink-0 rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={stopScannerAndClose}
        >
          Cerrar
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 py-4">
        <video
          ref={videoRef}
          className="aspect-video w-full max-w-lg rounded-lg bg-black object-cover shadow-lg ring-1 ring-white/10"
          muted
          playsInline
        />
        <p className="max-w-lg px-1 text-center text-sm leading-snug text-white/90">
          {status === "error" ? errorMessage : statusLabel[status]}
        </p>
        {continuous && lastOkRead && status !== "error" ? (
          <p className="max-w-lg px-1 text-center text-xs text-emerald-300/90">
            Último código: <span className="font-mono">{lastOkRead}</span>
          </p>
        ) : null}
      </div>

      {continuous ? (
        <div className="shrink-0 border-t border-white/10 bg-black/50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 transition hover:bg-emerald-400 active:scale-[0.99]"
            onClick={stopScannerAndClose}
          >
            Terminado
          </button>
          <p className="mt-2 text-center text-[11px] leading-snug text-white/55">
            Los productos ya quedaron en la venta. Este botón solo cierra la cámara.
          </p>
        </div>
      ) : (
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" aria-hidden />
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
