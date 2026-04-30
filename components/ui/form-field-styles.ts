/**
 * Clases compartidas para inputs/selects nativos en formularios del panel.
 * Usan tokens del tema para que modo claro/oscuro sea consistente (evita texto claro sobre fondo blanco).
 */
export const panelInputClass =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Misma base que input; útil para <select> */
export const panelSelectClass = panelInputClass;

/** Campo numérico compacto (tablas de venta, etc.) */
export const panelInputCompactClass =
  "h-9 w-28 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Textarea alineada al panel */
export const panelTextareaClass =
  "min-h-[88px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Contenedor tipo tarjeta para bloques de formulario */
export const formSectionClass =
  "rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm md:p-4";

/** Bloque secundario (modo rápido, confirmación, resumen) */
export const formMutedSectionClass =
  "rounded-xl border border-border bg-muted/50 p-3 text-foreground md:p-4";

/** Contenedor principal del formulario (envoltorio) */
export const formShellClass =
  "space-y-5 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm md:p-5";

/** Botón tipo outline para acciones secundarias en formularios (ej. escanear código) */
export const formSecondaryButtonClass =
  "inline-flex w-full shrink-0 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:w-auto";
