import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeFaviconSync } from "@/components/brand/theme-favicon-sync";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BRAND_FAVICONS } from "@/config/brand-assets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MultiStock",
    template: "%s | MultiStock",
  },
  description:
    "Inventario, ventas y alertas en un solo panel para comercios en Chile: verdulería, almacén y ferretería.",
  icons: {
    icon: BRAND_FAVICONS.map(({ src, sizes, media }) => ({
      url: src,
      sizes,
      type: "image/png",
      media,
    })),
    shortcut: [
      {
        url: "/brand/favicons/favicon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/favicons/favicon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeFaviconSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
