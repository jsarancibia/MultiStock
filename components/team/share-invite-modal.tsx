"use client";

import { useEffect, useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { toDataURL } from "qrcode";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, X, Smartphone } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  registerUrl: string;
};

export function ShareInviteModal({ open, onOpenChange, email, registerUrl }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      toDataURL(registerUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#18181b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [open, registerUrl]);

  const handleCopy = async () => {
    if (typeof navigator.clipboard?.writeText === "function") {
      try {
        await navigator.clipboard.writeText(registerUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Sin permiso de clipboard, ignorar
      }
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Únete a mi negocio en MultiStock",
          text: `Has sido invitado a unirte a mi negocio en MultiStock. Regístrate aquí:`,
          url: registerUrl,
        });
      } catch {
        // Usuario canceló el share, ignorar
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[ending-style='fade']:opacity-0 data-[starting-style='fade']:opacity-0" />
        <AlertDialog.Popup className="fixed bottom-0 left-1/2 z-50 mx-auto w-full max-w-sm -translate-x-1/2 rounded-t-2xl border border-border bg-card p-6 text-card-foreground shadow-lg outline-none md:bottom-1/2 md:translate-y-1/2 md:rounded-2xl data-[ending-style='scale-fade']:scale-95 data-[ending-style='scale-fade']:opacity-0 data-[starting-style='scale-fade']:scale-95 data-[starting-style='scale-fade']:opacity-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Compartir invitación</h2>
            <AlertDialog.Close render={<Button variant="ghost" size="icon" aria-label="Cerrar" />}>
              <X className="size-5" />
            </AlertDialog.Close>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Invitación para <span className="font-medium text-foreground">{email}</span>
          </p>

          {/* QR Code */}
          <div className="mx-auto mt-5 flex w-fit flex-col items-center gap-2 rounded-xl border bg-white p-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR de registro" className="size-[200px] rounded-lg" />
            ) : (
              <div className="flex size-[200px] items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                Generando QR...
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Smartphone className="size-3.5" />
              Escanea para registrarse
            </div>
          </div>

          {/* Link */}
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              O comparte este enlace:
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={registerUrl}
                className="min-w-0 flex-1 truncate rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground outline-none"
              />
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar enlace">
                {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Share button */}
          <div className="mt-6 space-y-2">
            <Button className="w-full gap-2" onClick={handleShare}>
              <Share2 className="size-4" />
              {typeof navigator.share === "function" ? "Compartir" : "Copiar enlace"}
            </Button>
            <AlertDialog.Close
              render={
                <Button variant="outline" className="w-full" />
              }
            >
              Cerrar
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
