# MultiStock — especificación ejecutada (`arquitectura-reportes`)

Resumen técnico de lo implementado a partir de `arquitectura-reportes.md`.

## Plantilla ERP por categoría (Excel `.xlsx`)

- Se descarga **un archivo Excel por categoría**: Productos, Inventario, Movimientos, Ventas o Alertas.
- Cada archivo tiene una hoja principal con logo MultiStock, encabezado superior, nombre del negocio/rubro, fecha de exportación y tabla estructurada.
- No existe un libro único con todos los reportes juntos; la UI conserva el flujo por categoría.
- Fila tipo **Lista / Reporte · …** antes de la tabla.
- Cabeceras en mayúsculas, primera fila congelada bajo banner.
- Banda de lectura por filas alternadas.
- Inventario con columnas calculadas **ESTADO** y **SOLICITAR**, con formato por semáforo (similar ERP).
- Resumen final con total de registros; Ventas incluye también **TOTAL $** sumado en el período exportado.

Rutas: `/api/exportaciones/[report]/excel`, donde `report` es `productos`, `inventario`, `movimientos`, `ventas` o `alertas`.

## CSV mejorado

Mismos datos que el Excel donde aplica (inventario con `estado_stock`, `solicitar`, categoría y almacén; alertas con `estado` texto; métodos/tipos más legibles), manteniendo descarga abierta desde la UI. Usa `sep=;` + BOM para que Excel en español no deje todo en una sola celda.

## Código principal

| Pieza | Ruta |
|-------|------|
| Consulta única datos | `lib/reports/export-queries.ts` |
| Estados inventario | `lib/reports/inventory-stock-status.ts` |
| Generación Excel por categoría | `lib/reports/build-category-excel.ts` |
| CSV + servidor | `modules/core/reports/actions.ts` |
| Descarga HTTP | `app/api/exportaciones/[report]/excel/route.ts` |
| Pantalla usuario | `app/(app)/exportaciones/page.tsx` |

## Checklist

- Encabezado dice MultiStock ✓  
- Sin botones innecesarios ✓  
- Tablas claras ✓  
- Estados calculados (inventario y alertas) ✓  
- Totales ✓  
- Diseño único reusable por hoja ✓  
