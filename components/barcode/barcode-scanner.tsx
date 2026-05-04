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
      ? "Escaneá varios códigos seguidos. Cuando termines, tocá el botón verde «Terminado» abajo."
      : "Apuntá al código de barras dentro del recuadro.",
    invalid_read: "Ese código no es válido. Probá de nuevo.",
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
      className="fixed inset-0 z-[200] flex flex-col bg-zinc-950 pt-[env(safe-area-inset-top)] antialiased"
      role="dialog"
      aria-modal="true"
      aria-label={continuous ? "Escanear varios códigos de barras" : "Escanear código de barras"}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-zinc-950 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight text-white">
            {continuous ? "Escanear productos" : "Escanear código"}
          </p>
          {continuous ? (
            <p className="mt-0.5 truncate text-xs font-medium text-zinc-400">Modo varios códigos</p>
          ) : null}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          onClick={stopScannerAndClose}
        >
          Cerrar
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-zinc-950">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-stretch gap-4 px-4 py-5">
          <video
            ref={videoRef}
            className="aspect-video w-full shrink-0 rounded-2xl bg-black object-cover shadow-xl ring-1 ring-white/10"
            muted
            playsInline
          />

          <div className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3.5 shadow-lg shadow-black/40">
            <p className="text-center text-[15px] font-normal leading-relaxed text-zinc-100">
              {status === "error" ? (
                <span className="text-red-300">{errorMessage}</span>
              ) : (
                statusLabel[status]
              )}
            </p>
            {continuous && lastOkRead && status !== "error" ? (
              <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-950/60 px-3 py-2.5">
                <p className="text-center text-[11px] font-medium uppercase tracking-wide text-emerald-400/90">
                  Último leído
                </p>
                <p className="mt-1 break-all text-center font-mono text-sm font-semibold tracking-wide text-emerald-100">
                  {lastOkRead}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {continuous ? (
        <footer className="shrink-0 border-t border-white/10 bg-zinc-950 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/50 transition hover:bg-emerald-500 active:scale-[0.99]"
            onClick={stopScannerAndClose}
          >
            Terminado
          </button>
          <p className="mt-2.5 text-center text-xs leading-relaxed text-zinc-400">
            Cierra la cámara. Los productos que leíste ya quedaron en la venta.
          </p>
        </footer>
      ) : (
        <footer className="shrink-0 bg-zinc-950 pb-[env(safe-area-inset-bottom)]" aria-hidden />
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
