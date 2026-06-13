"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserCodeReader, BrowserMultiFormatOneDReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";
import { applyPipeline } from "@/lib/barcode/preprocess";
import { FrameStabilityDetector } from "@/lib/barcode/frame-stability";
import { recordScan } from "@/lib/barcode/scan-metrics";

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
const FOCUS_INTERVAL_MS = 2500;
const FRAME_SKIP = 3;

const HINTS = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
    ],
  ],
]);

const supportsFocusMode =
  typeof navigator !== "undefined" &&
  typeof navigator.mediaDevices?.getSupportedConstraints === "function" &&
  !!(navigator.mediaDevices.getSupportedConstraints() as Record<string, unknown>).focusMode;

function buildConstraints(
  deviceId: string | undefined,
  lowQuality: boolean,
): MediaStreamConstraints {
  const video: MediaTrackConstraints & Record<string, unknown> = lowQuality
    ? {
        width: { min: 320, ideal: 640, max: 640 },
        height: { min: 240, ideal: 480, max: 480 },
        frameRate: { ideal: 15, max: 15 },
      }
    : {
        width: { min: 640, ideal: 1280, max: 1280 },
        height: { min: 480, ideal: 720, max: 720 },
        frameRate: { ideal: 30, max: 30 },
      };
  if (deviceId) {
    video.deviceId = { exact: deviceId };
  } else {
    video.facingMode = { ideal: "environment" };
  }
  if (supportsFocusMode) {
    video.focusMode = "continuous";
  }
  return { video, audio: false };
}

function reapplyFocusConstraint(track: MediaStreamTrack | null) {
  if (!track) return;
  try {
    track
      .applyConstraints({ advanced: [{ focusMode: "continuous" } as never] })
      .catch(() => {});
  } catch {
    /* ignore */
  }
}

export function BarcodeScanner({ open, onClose, onDetected, continuous = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatOneDReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasDetectedRef = useRef(false);
  const lastEmittedRef = useRef<{ code: string; at: number } | null>(null);
  const rearmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const focusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stabilityRef = useRef(new FrameStabilityDetector());
  const startTimeRef = useRef(0);
  const failCountRef = useRef(0);
  const lowQualityRef = useRef(false);
  const continuousRef = useRef(continuous);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastOkRead, setLastOkRead] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const [qualityVersion, setQualityVersion] = useState(0);
  const [tapRipple, setTapRipple] = useState<{ x: number; y: number; key: number } | null>(null);

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
    startTimeRef.current = performance.now();
    stabilityRef.current.reset();
    failCountRef.current = 0;
    lowQualityRef.current = false;
    startTransition(() => setLastOkRead(null));
    if (rearmTimerRef.current) {
      clearTimeout(rearmTimerRef.current);
      rearmTimerRef.current = null;
    }

    const reader = new BrowserMultiFormatOneDReader(HINTS, {
      delayBetweenScanAttempts: 100,
      delayBetweenScanSuccess: 200,
    });
    readerRef.current = reader;

    const { drawImageOnCanvas: originalDraw } = BrowserMultiFormatOneDReader;
    const frameCounter = { count: 0 };

    BrowserMultiFormatOneDReader.drawImageOnCanvas = (ctx, video) => {
      const vw = video instanceof HTMLVideoElement ? video.videoWidth : ctx.canvas.width;
      const vh = video instanceof HTMLVideoElement ? video.videoHeight : ctx.canvas.height;
      if (!vw || !vh) {
        originalDraw(ctx, video);
        return;
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(video, 0, 0, vw, vh);

      frameCounter.count++;
      if (frameCounter.count % FRAME_SKIP !== 0) {
        return;
      }

      const imageData = ctx.getImageData(0, 0, vw, vh);
      const state = stabilityRef.current.feed(imageData);

      if (state === "stable") {
        const best = stabilityRef.current.getBestFrame();
        if (best) {
          applyPipeline(best.data, best.width, best.height);
          ctx.putImageData(best, 0, 0);
          stabilityRef.current.reset();
          return;
        }
      }

      applyPipeline(imageData.data, imageData.width, imageData.height);
      ctx.putImageData(imageData, 0, 0);
    };

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

      BrowserCodeReader.listVideoInputDevices()
        .then((cameras) => {
          if (!cancelled) setVideoDevices(cameras);
        })
        .catch(() => {});

      reader
        .decodeFromConstraints(buildConstraints(currentDeviceId, lowQualityRef.current), video, (result, _err, controls) => {
          if (cancelled || hasDetectedRef.current) return;
          if (!result) {
            if (_err) failCountRef.current++;
            if (!lowQualityRef.current && failCountRef.current >= 15) {
              lowQualityRef.current = true;
              setQualityVersion((v) => v + 1);
            }
            return;
          }
          failCountRef.current = 0;
          const text = result.getText();
          const normalized = normalizeBarcode(text);
          if (!isValidBarcodeFormat(normalized)) {
            recordScan("invalid", performance.now() - startTimeRef.current, continuousRef.current);
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
            recordScan("success", performance.now() - startTimeRef.current, true);
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
          recordScan("success", performance.now() - startTimeRef.current, false);
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
          if (controls.switchTorch) {
            controls.switchTorch(true).catch(() => {});
          }
          const stream = video.srcObject as MediaStream | null;
          if (stream) {
            const [track] = stream.getVideoTracks();
            trackRef.current = track;
            reapplyFocusConstraint(track);
            focusIntervalRef.current = setInterval(
              () => reapplyFocusConstraint(track),
              FOCUS_INTERVAL_MS,
            );
          }
          BrowserCodeReader.listVideoInputDevices()
            .then((cameras) => {
              if (!cancelled) setVideoDevices(cameras);
            })
            .catch(() => {});
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : String(err);
          const lower = msg.toLowerCase();
          if (currentDeviceId && (lower.includes("overconstrained") || lower.includes("constraint"))) {
            setCurrentDeviceId(undefined);
            return;
          }
          setStatus("error");
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
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
      trackRef.current = null;
      try {
        controlsRef.current?.stop();
      } catch {
        /* ignore */
      }
      controlsRef.current = null;
      readerRef.current = null;
      BrowserCodeReader.releaseAllStreams();
    };
  }, [open, continuous, currentDeviceId, qualityVersion]);

  if (!open) return null;

  if (typeof document === "undefined") return null;

  const statusLabel: Record<ScanStatus, string> = {
    idle: "",
    preparing: "Preparando cámara…",
    scanning: continuous
      ? "Escaneá varios códigos. Tocá la cámara para re-enfocar. Terminá con el botón verde."
      : "Apuntá al código a 15-30 cm. Tocá la cámara si se ve borroso.",
    invalid_read: "Ese código no es válido. Probá de nuevo.",
    error: errorMessage ?? "Error",
  };

  function switchCamera() {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setCurrentDeviceId(videoDevices[nextIndex].deviceId);
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    setTapRipple({ x: clientX - rect.left, y: clientY - rect.top, key: Date.now() });
    reapplyFocusConstraint(trackRef.current);
    setTimeout(() => setTapRipple(null), 600);
  }

  function stopScannerAndClose() {
    if (!hasDetectedRef.current) {
      recordScan("notfound", performance.now() - startTimeRef.current, continuousRef.current);
    }
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
    <>
      <style>{`
        @keyframes tap-ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `}</style>
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
          <div
            className="relative shrink-0 cursor-crosshair overflow-hidden rounded-2xl"
            onClick={handleTap}
            onTouchStart={handleTap}
          >
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black object-cover shadow-xl ring-1 ring-white/10"
              autoPlay
              muted
              playsInline
            />
            {tapRipple && (
              <span
                key={tapRipple.key}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30"
                style={{ left: tapRipple.x, top: tapRipple.y, width: 40, height: 40, animation: "tap-ripple 0.5s ease-out forwards" }}
              />
            )}
            {status === "scanning" && (
              <svg
                className="pointer-events-none absolute inset-0"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <rect
                  x={22.5}
                  y={22.5}
                  width={55}
                  height={55}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.6"
                  strokeDasharray="3 3"
                  opacity={0.45}
                  rx={1.5}
                />
                <line x1="0" y1="22.5" x2="100" y2="22.5" stroke="white" strokeWidth="0.3" opacity={0.15} />
                <line x1="0" y1="77.5" x2="100" y2="77.5" stroke="white" strokeWidth="0.3" opacity={0.15} />
              </svg>
            )}
            {videoDevices.length >= 2 && (
              <button
                type="button"
                onClick={switchCamera}
                aria-label="Cambiar cámara"
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/70 text-white shadow-lg ring-1 ring-white/20 backdrop-blur transition hover:bg-zinc-900/80 active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  <path d="M17 20v-1a4 4 0 0 0-4-4h-2" />
                  <path d="M13 19l2 2 2-2" />
                </svg>
              </button>
            )}
          </div>

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
    </>
  );

  return createPortal(overlay, document.body);
}
