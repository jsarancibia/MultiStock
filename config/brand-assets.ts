export const BRAND_LOGOS = {
  light: {
    src: "/brand/logos/multistock-logo-light.jpg",
    width: 1344,
    height: 768,
  },
  dark: {
    src: "/brand/logos/multistock-logo-dark.jpg",
    width: 1248,
    height: 832,
  },
} as const;

export const BRAND_FAVICONS = [
  {
    tone: "light",
    src: "/brand/favicons/favicon-light-16x16.png",
    sizes: "16x16",
    media: "(prefers-color-scheme: light)",
  },
  {
    tone: "light",
    src: "/brand/favicons/favicon-light-32x32.png",
    sizes: "32x32",
    media: "(prefers-color-scheme: light)",
  },
  {
    tone: "light",
    src: "/brand/favicons/favicon-light-64x64.png",
    sizes: "64x64",
    media: "(prefers-color-scheme: light)",
  },
  {
    tone: "dark",
    src: "/brand/favicons/favicon-dark-16x16.png",
    sizes: "16x16",
    media: "(prefers-color-scheme: dark)",
  },
  {
    tone: "dark",
    src: "/brand/favicons/favicon-dark-32x32.png",
    sizes: "32x32",
    media: "(prefers-color-scheme: dark)",
  },
  {
    tone: "dark",
    src: "/brand/favicons/favicon-dark-64x64.png",
    sizes: "64x64",
    media: "(prefers-color-scheme: dark)",
  },
] as const;

