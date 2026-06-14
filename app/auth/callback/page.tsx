"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const supabase = createClient();
    let timeoutId: ReturnType<typeof setTimeout>;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const rawNext = params.get("next") ?? "/dashboard";
      const next = rawNext.startsWith("/") ? rawNext : "/dashboard";

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          router.push(next);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push(next);
        return;
      }

      setError("No se pudo verificar el enlace. Solicita uno nuevo.");
      timeoutId = setTimeout(() => router.push("/auth/forgot-password"), 3000);
    }

    handleCallback();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="space-y-3 text-center">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Verificando enlace…</p>
          </>
        )}
      </div>
    </div>
  );
}
