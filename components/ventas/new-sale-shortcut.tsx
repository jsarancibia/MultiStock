"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function NewSaleShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";
      if (isTyping) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        router.push("/ventas/nueva");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
