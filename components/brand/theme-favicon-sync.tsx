"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { BRAND_FAVICONS } from "@/config/brand-assets";

export function ThemeFaviconSync() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    const tone = (resolvedTheme ?? theme) === "dark" ? "dark" : "light";
    const favicons = BRAND_FAVICONS.filter((favicon) => favicon.tone === tone);

    document
      .querySelectorAll<HTMLLinkElement>('link[data-multistock-favicon="true"]')
      .forEach((element) => element.remove());

    for (const favicon of favicons) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.sizes = favicon.sizes;
      link.href = favicon.src;
      link.dataset.multistockFavicon = "true";
      document.head.appendChild(link);
    }

    const shortcut = favicons.find((favicon) => favicon.sizes === "32x32");
    if (shortcut) {
      const link = document.createElement("link");
      link.rel = "shortcut icon";
      link.type = "image/png";
      link.sizes = shortcut.sizes;
      link.href = shortcut.src;
      link.dataset.multistockFavicon = "true";
      document.head.appendChild(link);
    }
  }, [resolvedTheme, theme]);

  return null;
}

