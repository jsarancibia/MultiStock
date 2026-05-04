import { Suspense } from "react";
import { MobileBarcodeScannerPage } from "@/components/barcode/mobile-barcode-scanner-page";

export default function EscanearCodigoPage() {
  return (
    <Suspense fallback={<ScannerFallback />}>
      <MobileBarcodeScannerPage />
    </Suspense>
  );
}

function ScannerFallback() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-950 px-4 text-white">
      <div className="rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 text-sm text-zinc-200">
        Preparando escáner...
      </div>
    </main>
  );
}
