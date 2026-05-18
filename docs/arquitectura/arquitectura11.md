# Arquitectura 11 - Sistema de logos y favicons

Este documento define la capa de identidad visual de MultiStock para separar los assets oficiales de marca del código de UI y evitar referencias sueltas a archivos de imagen.

## Objetivo

Usar siempre los logos oficiales sin texto inferior y los favicons optimizados por tamaño y tono, manteniendo una implementación consistente para modo claro y oscuro.

## Estructura pública

Los assets consumidos por la aplicación viven bajo `public/brand`:

- `public/brand/logos/multistock-logo-light.jpg`
- `public/brand/logos/multistock-logo-dark.jpg`
- `public/brand/favicons/favicon-light-16x16.png`
- `public/brand/favicons/favicon-light-32x32.png`
- `public/brand/favicons/favicon-light-64x64.png`
- `public/brand/favicons/favicon-dark-16x16.png`
- `public/brand/favicons/favicon-dark-32x32.png`
- `public/brand/favicons/favicon-dark-64x64.png`

Los originales editables permanecen en `assets/logo-oficial` y `assets/logo-system/favicons`.

## Capa de configuración

`config/brand-assets.ts` es la única fuente de verdad para rutas, tamaños y media queries de favicon. Cualquier componente o metadata debe importar desde esa capa en lugar de escribir rutas manuales.

## Componentes

`components/brand/brand-logo.tsx` renderiza el logo correspondiente al tema:

- `tone="auto"` cambia entre claro y oscuro con la clase `dark`.
- `tone="dark"` o `tone="light"` fuerza un tono cuando el contenedor lo requiere.
- `fit="contain"` conserva el encuadre completo.
- `fit="cover"` sirve para espacios compactos donde el isotipo debe llenar mejor el contenedor.

## Metadata

`app/layout.tsx` registra los seis favicons con `media: (prefers-color-scheme: light|dark)` y tamaños `16x16`, `32x32` y `64x64`, para que el navegador elija el archivo correcto según dispositivo y tono del sistema.

