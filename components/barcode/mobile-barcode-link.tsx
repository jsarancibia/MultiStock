"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type MobileBarcodeLinkProps = {
  onDetected: (barcode: string) => void;
  className?: string;
};

type LinkStatus = "idle" | "opening" | "ready" | "connected" | "received" | "error";

type BarcodePayload = {
  token?: unknown;
  barcode?: unknown;
};

const CHANNEL_PREFIX = "barcode-link";

function createRandomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function MobileBarcodeLink({ onDetected, className }: MobileBarcodeLinkProps) {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const tokenRef = useRef<string>("");
  const onDetectedRef = useRef(onDetected);

  const [open, setOpen] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [status, setStatus] = useState<LinkStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const cleanupChannel = useCallback(() => {
    const channel = channelRef.current;
    const supabase = supabaseRef.current;
    channelRef.current = null;
    if (channel && supabase) {
      void supabase.removeChannel(channel);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    cleanupChannel();
  }, [cleanupChannel]);

  const startLink = useCallback(async () => {
    if (typeof window === "undefined") return;

    cleanupChannel();
    setOpen(true);
    setStatus("opening");
    setError(null);
    setLastCode(null);
    setQrDataUrl("");

    const nextSessionId = crypto.randomUUID();
    const nextToken = createRandomToken();
    tokenRef.current = nextToken;

    const url = new URL("/escanear-codigo", window.location.origin);
    url.searchParams.set("s", nextSessionId);
    url.searchParams.set("t", nextToken);
    const nextScanUrl = url.toString();
    setScanUrl(nextScanUrl);

    try {
      const [nextQrDataUrl, supabase] = await Promise.all([
        QRCode.toDataURL(nextScanUrl, {
          margin: 1,
          width: 256,
          color: {
            dark: "#111827",
            light: "#ffffff",
          },
        }),
        Promise.resolve(supabaseRef.current ?? createClient()),
      ]);

      supabaseRef.current = supabase;

      const channel = supabase
        .channel(`${CHANNEL_PREFIX}:${nextSessionId}`)
        .on("broadcast", { event: "ready" }, ({ payload }) => {
          const linkedToken = (payload as BarcodePayload | null)?.token;
          if (linkedToken === tokenRef.current) {
            setStatus("connected");
          }
        })
        .on("broadcast", { event: "barcode" }, ({ payload }) => {
          const data = payload as BarcodePayload | null;
          if (data?.token !== tokenRef.current || typeof data.barcode !== "string") return;
          setLastCode(data.barcode);
          setStatus("received");
          onDetectedRef.current(data.barcode);
        })
        .subscribe((subscriptionStatus) => {
          if (subscriptionStatus === "SUBSCRIBED") {
            setQrDataUrl(nextQrDataUrl);
            setStatus("ready");
          }
          if (subscriptionStatus === "CHANNEL_ERROR" || subscriptionStatus === "TIMED_OUT") {
            setStatus("error");
            setError("No se pudo abrir el enlace con el celular. Probá de nuevo.");
          }
        });

      channelRef.current = channel;
    } catch {
      setStatus("error");
      setError("No se pudo generar el QR para enlazar el celular.");
    }
  }, [cleanupChannel]);

  useEffect(() => cleanupChannel, [cleanupChannel]);

  const statusText = useMemo(() => {
    if (error) return error;
    if (status === "opening") return "Preparando enlace seguro...";
    if (status === "ready") return "Escaneá este QR con el celular.";
    if (status === "connected") return "Celular conectado. Escaneá el código de barras.";
    if (status === "received") return "Código recibido en la PC.";
    return "Generá un enlace temporal para escanear desde el celular.";
  }, [error, status]);

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[190] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Enlace con celular para escanear código"
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Escanear con celular</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Abrí este QR en el celular y el código leído se cargará acá automáticamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground transition hover:bg-muted"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-background p-4">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="Código QR para enlazar el celular"
                    width={224}
                    height={224}
                    unoptimized
                    className="mx-auto size-56 rounded-lg bg-white p-2"
                  />
                ) : (
                  <div className="mx-auto grid size-56 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                    Generando QR...
                  </div>
                )}
              </div>

              <p
                className={cn(
                  "mt-3 rounded-lg px-3 py-2 text-sm",
                  status === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {statusText}
              </p>

              {lastCode ? (
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Último código recibido
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    {lastCode}
                  </p>
                </div>
              ) : null}

              {scanUrl ? (
                <p className="mt-3 break-all text-xs text-muted-foreground">
                  Si el QR no abre, ingresá desde el celular a este enlace: {scanUrl}
                </p>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button type="button" onClick={startLink} className={className}>
        Enlace con celular
      </button>
      {modal}
    </>
  );
}
