"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SendStatus = "idle" | "connecting" | "connected" | "sent" | "error";

const CHANNEL_PREFIX = "barcode-link";

export function MobileBarcodeScannerPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("s") ?? "";
  const token = searchParams.get("t") ?? "";

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasValidLink = Boolean(sessionId && token);

  const cleanupChannel = useCallback(() => {
    const channel = channelRef.current;
    const supabase = supabaseRef.current;
    channelRef.current = null;
    if (channel && supabase) {
      void supabase.removeChannel(channel);
    }
  }, []);

  useEffect(() => {
    if (!hasValidLink) return;

    cleanupChannel();

    try {
      const supabase = supabaseRef.current ?? createClient();
      supabaseRef.current = supabase;

      const channel = supabase.channel(`${CHANNEL_PREFIX}:${sessionId}`);
      channel.subscribe(async (subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("connected");
          setScannerOpen(true);
          await channel.send({
            type: "broadcast",
            event: "ready",
            payload: { token },
          });
        }
        if (subscriptionStatus === "CHANNEL_ERROR" || subscriptionStatus === "TIMED_OUT") {
          setStatus("error");
          setError("No se pudo conectar con la PC. Volvé a escanear el QR.");
        }
      });

      channelRef.current = channel;
    } catch {
      queueMicrotask(() => {
        setStatus("error");
        setError("No se pudo iniciar el enlace con la PC.");
      });
    }

    return cleanupChannel;
  }, [cleanupChannel, hasValidLink, sessionId, token]);

  const sendBarcode = useCallback(
    async (barcode: string) => {
      const channel = channelRef.current;
      if (!channel) {
        setStatus("error");
        setError("El enlace con la PC todavía no está listo.");
        return;
      }

      setLastCode(barcode);
      setError(null);

      const response = await channel.send({
        type: "broadcast",
        event: "barcode",
        payload: { token, barcode },
      });

      if (response === "ok") {
        setStatus("sent");
        return;
      }

      setStatus("error");
      setError("No se pudo enviar el código. Revisá que el QR siga abierto en la PC.");
    },
    [token]
  );

  const statusText = useMemo(() => {
    if (!hasValidLink) return "Este enlace no es válido. Volvé a generar el QR desde la PC.";
    if (error) return error;
    if (status === "connecting") return "Conectando con la PC...";
    if (status === "connected") return "Conectado. Tocá escanear si la cámara no se abrió sola.";
    if (status === "sent") return "Código enviado a la PC.";
    return "Preparando escáner...";
  }, [error, hasValidLink, status]);

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            MultiStock
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Escanear código</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Leé el código de barras con este celular. Cuando se detecte, aparecerá automáticamente en
            el formulario abierto en la PC.
          </p>

          <div
            className={cn(
              "mt-5 rounded-2xl border px-4 py-3 text-sm",
              status === "error" || !hasValidLink
                ? "border-red-400/30 bg-red-950/50 text-red-100"
                : "border-white/10 bg-zinc-950 text-zinc-200"
            )}
          >
            {statusText}
          </div>

          {lastCode ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/60 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
                Último enviado
              </p>
              <p className="mt-1 break-all font-mono text-lg font-semibold text-emerald-50">
                {lastCode}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              disabled={!hasValidLink}
              onClick={() => setScannerOpen(true)}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-50"
            >
              Escanear código
            </button>
            <p className="text-center text-xs leading-relaxed text-zinc-400">
              Mantené abierta la ventana del QR en la PC hasta que el código aparezca.
            </p>
          </div>
        </div>
      </div>

      <BarcodeScanner
        open={scannerOpen && hasValidLink}
        onClose={() => setScannerOpen(false)}
        onDetected={(barcode) => {
          setScannerOpen(false);
          void sendBarcode(barcode);
        }}
      />
    </main>
  );
}
